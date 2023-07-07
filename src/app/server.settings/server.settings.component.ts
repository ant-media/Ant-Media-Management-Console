import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {HTTP_SERVER_ROOT, LiveBroadcast} from '../rest/rest.service';
import {ClipboardService} from 'ngx-clipboard';
import {MatDialog } from '@angular/material/dialog';
import {AfterViewInit, Component, Injectable, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, Input, Output} from '@angular/core';
import {ServerSettings, UserInfoTable, UserInf, Licence, SslConfigurationType} from "../app.page/app.definitions";
import {Locale} from "../locale/locale";
import {AuthService} from "../rest/auth.service";
import {RestService, User, show403Error} from "../rest/rest.service";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient, HttpParams} from "@angular/common/http";
import {DataService} from "../rest/data.service";
import {MatPaginator, MatPaginatorIntl, PageEvent} from "@angular/material/paginator"
import {MatTableDataSource} from "@angular/material/table"
import {MatSort} from "@angular/material/sort"
import {UserEditComponent} from './dialog/user.edit.dialog.component';
import {SslErrorComponent} from './dialog/server.settings.ssl.error.dialog.component';

import {LOCAL_STORAGE_EMAIL_KEY, LOCAL_STORAGE_ROLE_KEY} from '../rest/auth.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare var $:any;
declare var swal: any;

@Component({
    moduleId: module.id,
    selector: 'server.settings',
    templateUrl: './server.settings.component.html'
})


@Injectable()
export class ServerSettingsComponent implements  OnDestroy, OnInit, AfterViewInit{
    @ViewChild('sslConfigurationSelect') sslConfigurationSelect: ElementRef;

    get messageReceived(): string {
        return this._messageReceived;
    }

    set messageReceived(value: string) {
        this._messageReceived = value;
    }
    public serverSettings: ServerSettings;
    public sslConfType: string;
    public fqdn:string;
    public sslConfigurationResultDialog: MatDialog;
    private httpsPort = 5443;
    public crtFileExtension = "crt"
    public keyFileExtension = "key"
    public pemFileExtension = "pem"
    public settingsReceived = false;
    public licenseStatus = "Getting license status";
    public licenseStatusExplaination: string;
    public licenseStatusReceiving = false;
    public configureSslEnabled = true;
    public currentLicence : Licence;
    private _messageReceived : string;
    public timerId: any;
    public displayWarning = true;
    public leftDays : number;
    public isEnterpriseEdition = false;
    public currentLogLevel: string;
    public logLevelInfo : string= "INFO";
    public logLevelWarn : string = "WARN";
    public logLevelError : string = "ERROR";
    public logLevelOff : string = "OFF";
    public User : User;
    public newUserCreating = false;
    public AdminUserType : string = "ADMIN";
    public ReadOnlyUserType : string = "READ_ONLY";
    public BasicUserType : string = "USER";
    public SYSTEM_SCOPE_OF_ACCESS : string = "system";

    public applications : any;

    public displayedColumnsStreams = ['email', 'type', 'permissions', 'actions'];

    public dataSource: MatTableDataSource<UserInf>; 

    public userDataTable : UserInfoTable;

    public userListOffset = 0;
    public pageSize = 0;

    public newUserActive : boolean;
    public userNameEmpty = false;
    public confirmPasswordModel: string;

    public filter :string = "";

    public allLicensesUsedError : string = "ALL_LICENSES_ARE_USED";
    public noLicenseFounrError: string = "NO_LICENSE_FOUND";
    public licenseExpireError : string = "LICENSE_EXPIRED";
    public licenseServerRequestError : string = "serverRequestError";
    public invalidKeyError: string = "INVALID_KEY";
    public licenseBlocked: string = "LICENSE_BLOCKED";

    public TRIAL_PERIOD_ENDED: string = "TRIAL_PERIOD_ENDED";

    public userRole: string = localStorage.getItem(LOCAL_STORAGE_ROLE_KEY).toUpperCase();

    public fullChainFile: File;
    public privateKeyFile: File;
    public chainFile: File;
    public sslFormActive: boolean = false;

    constructor(private http: HttpClient, private route: ActivatedRoute,
                private restService: RestService,
                public dialog: MatDialog,
                private cdr: ChangeDetectorRef,
                public router: Router,private dataService: DataService, private authService: AuthService,) {
    }

    ngOnInit(){
        this.sslConfType = this.getSslConfigurationTypeName(SslConfigurationType.CUSTOM_DOMAIN);
        this.serverSettings = new ServerSettings('',null, false, this.logLevelInfo, false);
        this.currentLicence = new Licence(null,null,null,null,null,null,null);

        this.callTimer();
       
        this.userDataTable = {
            dataRows: [],
        };

        this.restService.getApplications().subscribe(data => {
            this.applications = data;
            console.debug(data);
        }, error => { show403Error(error); });
    }

    ngAfterViewInit() {
        this.restService.isEnterpriseEdition().subscribe(data => {
            this.isEnterpriseEdition = data["success"];
            this.getServerSettings();
        }, error => { show403Error(error); });

         this.getUserList(this.userListOffset,this.pageSize);
    }

    ngOnDestroy() {
        this.clearTimer();
    }
    

    logLevelChanged(event:any){

        if(event == this.logLevelInfo) {
            this.serverSettings.logLevel = this.logLevelInfo;
        }
        if(event == this.logLevelWarn) {
            this.serverSettings.logLevel = this.logLevelWarn;
        }
        if(event == this.logLevelError) {
            this.serverSettings.logLevel = this.logLevelError;
        }
        if(event == this.logLevelOff) {
            this.serverSettings.logLevel = this.logLevelOff;
        }
    }

    getSslConfigurationTypeName(sslConfigurationType:SslConfigurationType):string{
        return Object.keys(SslConfigurationType).find(key => SslConfigurationType[key] === sslConfigurationType);
    }

    sslConfigurationChanged(event:any){
        this.sslConfType = event
    }
    openSSLForm() {
        this.sslFormActive = true;
    }
    
    async handleSslCertificateFileInput(event: any) {
        var certificateFile = event.target.files[0]
        var inputId = event.target["id"].toString()
        switch(inputId){
            case "fullChainFileInput":
                this.fullChainFile = certificateFile;
                break

            case "keyFileInput":
                this.privateKeyFile = certificateFile;
                break

            case "chainFileInput":
                this.chainFile = certificateFile;
                break


        }
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.filter = filterValue;
        this.dataSource.filter = filterValue;
    }

    changeType(user: User): void {
        if (user.email == localStorage.getItem(LOCAL_STORAGE_EMAIL_KEY)) {
            $.notify({
                icon: "ti-alert",
                message: "You cannot edit yourself. If you want to change password, use the Change Password on the right top menu"
            }, {
                type: 'warning',
                delay: 4000,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });
            return;
        }
        
        let dialogRef = this.dialog.open(UserEditComponent, {
            data: {
                email : user.email,
                type: user.userType,
                scope: user.scope
            },
            width: "400px",
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.getUserList(this.userListOffset, this.pageSize);
        });
    
    }

    getUserList(offset: number, size: number): void {
        
        offset = offset * size;

        this.restService.getUsers().subscribe(data => {

            this.userDataTable.dataRows = [];

            for (var i in data) {

                var endpoint = [];
                for (var j in data[i].endPointList) {
                    endpoint.push(data[i].endPointList[j]);
                }
                this.userDataTable.dataRows.push(data[i]);
            }

            this.dataSource = new MatTableDataSource(this.userDataTable.dataRows);
            if(this.filter != "" || this.filter != undefined || this.filter != null){
                this.dataSource.filter = this.filter;
            }

            this.cdr.detectChanges();
        }, error => { show403Error(error); });

    }
    callTimer(){

        console.log("Timer Started");

        this.clearTimer();

        this.timerId = window.setInterval(() => {
            if(this.authService.isAuthenticated) {
                this.getUserList(this.userListOffset, this.pageSize);
            }

            }, 15000);
    }
    clearTimer() {

        clearInterval(this.timerId);
        this.timerId = null ;

    }


    public getLastLicenseStatus()
    {
        if (this.isEnterpriseEdition)
        {
            this.licenseStatusReceiving = true;
            this.restService.getLastLicenseStatus().subscribe(data => {
                this.licenseStatusReceiving = false;
                this.evaluateLicenseStatus(data);
            }, error => { show403Error(error); });
        }
    }

    public getLicenseStatus(){

        this.licenseStatusReceiving = true;

        if(this.isEnterpriseEdition){
            this.serverSettings.licenceKey = this.serverSettings.licenceKey.trim();
            this.restService.getLicenseStatus(this.serverSettings.licenceKey ).subscribe(data => {
                this.licenseStatusReceiving = false;
                this.evaluateLicenseStatus(data);
            }, error => { show403Error(error); });

        }

        return this.currentLicence;
    }

    public evaluateLicenseStatus(data:Object) {
        var licenseErrorTitle = "Invalid License";
        this.licenseStatusExplaination = "Please validate your license";

        if (data != null) {
            this.currentLicence  = <Licence>data;
        }

        if(this.currentLicence == null || this.currentLicence.licenceId == null)  {

            this.licenseStatus = "Invalid";
            console.log("invalid license");

            if (this.currentLicence.status == this.licenseServerRequestError){

                licenseErrorTitle = "Could Not Connect To License Server";
                this.licenseStatus = "Network is unaccessible"
                this.licenseStatusExplaination = "Please check your connection"
            }
            else if (this.currentLicence.status == this.licenseExpireError) 
            {
                this.licenseStatus = "Expired";
                this.licenseStatusExplaination = "Your license is expired, please renew your license at antmedia.io";
            }
            else if (this.currentLicence.status == this.invalidKeyError ||
                this.currentLicence.status == this.noLicenseFounrError) 
            {
                this.licenseStatusExplaination = "Your license key is invalid";
            }
            else if (this.currentLicence.status == this.licenseBlocked) 
            {
                this.licenseStatus = "Suspended";
                this.licenseStatusExplaination = "Your license is suspended. Please renew your license at antmedia.io";
            }
            else if (this.currentLicence.status == this.allLicensesUsedError) 
            {
                this.licenseStatusExplaination = "You have reached your licence limit. Please close some of your running instances";
            }
            else  if (this.currentLicence.status == this.TRIAL_PERIOD_ENDED) {
                this.licenseStatus = "Trial expired";
                this.licenseStatusExplaination = "Your trial period is expired. Please buy a license at antmedia.io or extend your trial";
            }
            
            if (this.authService.licenceWarningDisplay && !this.serverSettings.buildForMarket) {

                swal({
                    title: licenseErrorTitle,
                    text: this.licenseStatusExplaination,
                    type: 'error',

                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',

                    onClose: function () {

                    }
                }).then(() => {

                }).catch(function () {

                });
            }
        }
        else{

            this.licenseStatus = "Valid";

            this.authService.licenceWarningDisplay = false;

            let end =this.currentLicence.endDate;

            this.leftDays = this.differenceInDays(new Date().getTime(), new Date(end).getTime());

            if (this.leftDays <16 && this.authService.licenceWarningDisplay){

                console.log("Your license expires in " + this.leftDays + " days");

                swal({
                    title: "Your license expires in " + this.leftDays + " days",
                    text: "Please Renew Your License ",
                    type: 'info',

                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',

                    onClose: function () {

                    }
                }).then(() => {

                }).catch(function () {

                });

                this.authService.licenceWarningDisplay = false;
            }
        }
    }

    changeServerSettings(isValid : boolean): void {

        if (!isValid) {
            return;
        }

        // this.licenseStatusReceiving = true;
        if(!this.serverSettings.buildForMarket && this.isEnterpriseEdition) 
        {   
            console.log(this.serverSettings)
            this.restService.changeServerSettings(this.serverSettings).subscribe(data => {
                if (data["success"] == true) {
                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().license_saved
                    }, {
                        type: "success",
                        delay: 900,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });

                    this.authService.serverSettings = this.serverSettings;
                    this.authService.licenceWarningDisplay = true;
                    if(!this.serverSettings.buildForMarket){
                        this.getLicenseStatus()
                    }
                }
                else {
                    $.notify({
                        icon: "ti-alert",
                        message: Locale.getLocaleInterface().settings_not_saved
                    }, {
                        type: 'warning',
                        delay: 1900,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });

                }
            }, error => { show403Error(error); });
        }
    }
    newUser(): void {
        this.newUserActive = true;
        this.userNameEmpty = false;
        this.User = new User("","")
    }
     isValidDomain(domain):boolean {
        let regex = new RegExp(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,}$/);

        if (domain == null) {
            return false
        }

        if (regex.test(domain)) {
            return true
        }
        return false
    }

    getDomainAsHttpsLink(){
        return "https://"+this.serverSettings.serverName+":"+this.httpsPort;
    }

    certificateFilesReady() {

        if (this.fullChainFile != null && this.chainFile != null && this.privateKeyFile != null) {
            return true;
        }
        return false;
    }

    configureSsl(){
        if ((this.sslConfType == this.getSslConfigurationTypeName(SslConfigurationType.CUSTOM_DOMAIN) 
            || this.sslConfType == this.getSslConfigurationTypeName(SslConfigurationType.CUSTOM_CERTIFICATE))
            && !this.isValidDomain(this.fqdn)) 
        {
            //TODO: It's not good to give alert. Give inline warnings
            alert("Please enter a valid domain.")
            return
        }
        else if (this.sslConfType == this.getSslConfigurationTypeName(SslConfigurationType.CUSTOM_CERTIFICATE) 
                && !this.certificateFilesReady()){

            //TODO: It's not good to give alert. Give inline warnings
            alert("Please enter certificate files")
            return;
        }
        else {
            swal({
                title: "Confirmation",
                text: "Server will be restarted automatically after this operaiton",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Proceed'
            }).then(() => {
    
                $.notify({
                    icon: "ti-info",
                    message: "SSL configuration has started. Please wait a minute..."
                }, {
                    type: "info",
                    delay: 5000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
               
                this.configureSslEnabled = false
                let formData = new FormData();
                formData.append('fullChainFile', this.fullChainFile);
                formData.append('privateKeyFile', this.privateKeyFile);
                formData.append('chainFile', this.chainFile);
                
                this.restService.changeSslSettings(this.fqdn, this.sslConfType, formData).subscribe(configurationResponse => {
                    var completedMessage = "SSL configuration completed. Please refresh the page and login again."
                           
                    $.notify({
                        icon: "ti-info",
                        message: completedMessage,
                    }, {
                        type: "success",
                        delay: 3500,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
        
                }, error => {
                    console.log("SSL problem");
                    console.log(error);
                    this.configureSslEnabled = true;
                })
    
            }).catch(function () {
    
            });
        }
    }

    cancelNewUser(): void {
        this.newUserActive = false;
    }
    deleteUser(email : string){
        var userEmail = localStorage.getItem(LOCAL_STORAGE_EMAIL_KEY)
        if (userEmail == email) {
            $.notify({
                icon: "ti-save",
                message: "You cannot delete yourself",
            }, {
                type: "warning",
                delay: 900,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });
            return ;
        }

        swal({
            title: Locale.getLocaleInterface().are_you_sure,
            text: Locale.getLocaleInterface().wont_be_able_to_revert,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(data => {

            this.restService.deleteUser(email)
                .subscribe(data => {
                    if (data["success"] == true) {

                        $.notify({
                            icon: "ti-save",
                            message: "Successfully deleted"
                        }, {
                            type: "success",
                            delay: 900,
                            placement: {
                                from: 'top',
                                align: 'right'
                            }
                        });

                    }
                    else {
                        $.notify({
                            icon: "ti-alert",
                            message: "User is not deleted"
                        }, {
                            type: "warning",
                            delay: 900,
                            placement: {
                                from: 'top',
                                align: 'right'
                            }
                        });
                    }
                    this.getUserList(this.userListOffset, this.pageSize);
                }, error => { show403Error(error); });
        });

    }

    
    get ConfigurationTypes():typeof SslConfigurationType{
        return SslConfigurationType;
    }


    createUser(isValid: boolean): void {
        console.log("create user called");
        this.userNameEmpty = false;

        if (!isValid) {
            //not valid form return directly
            console.log("Form is not valid");
            return;
        }

        console.log("create user called 2");
        if (!this.restService.checkStreamName(this.User.email)){
            this.userNameEmpty = true;
            return;
        }

        console.log("create user called 3");
        this.newUserCreating = true;
        this.restService.createUser(this.User)
            .subscribe(data => {
                console.log("data :" + JSON.stringify(data));
                if (data["success"] == true) {
                    this.newUserActive = false;

                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().new_user_created
                    }, {
                        type: "success",
                        delay: 900,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                    this.getUserList(this.userListOffset, this.pageSize);
                    this.User.fullName = "";
                }
                else {
                    $.notify({
                        icon: "ti-alert",
                        message: "User is not created. " + data["message"],
                    }, {
                        type: "warning",
                        delay: 900,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                }
            }, error => { show403Error(error); });
            this.newUserCreating = false;
        }
        
    getServerSettings(): void {
        this.restService.getServerSettings().subscribe(data => {
            this.serverSettings = <ServerSettings>data;
            console.log(this.serverSettings)
            this.settingsReceived = true;
            this.sslFormActive = !this.serverSettings.sslEnabled;
            //this.currentSslSettings = this.serverSettings.sslSettings;

            if(!this.serverSettings.buildForMarket){
                this.getLastLicenseStatus()
            }

        }, error => { show403Error(error); });
    }

    differenceInDays(firstDate: number, secondDate: number) {
        return Math.round((secondDate-firstDate)/(1000*60*60*24));
    }
}