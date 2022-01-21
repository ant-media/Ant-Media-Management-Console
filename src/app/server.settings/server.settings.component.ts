
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {HTTP_SERVER_ROOT, LiveBroadcast} from '../rest/rest.service';
import {ClipboardService} from 'ngx-clipboard';
import {MatDialog } from '@angular/material/dialog';



import {AfterViewInit, Component, Injectable, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, Input, Output} from '@angular/core';
import {ServerSettings, UserInfoTable, UserInf} from "../app.page/app.definitions";
import {Locale} from "../locale/locale";
import {AuthService} from "../rest/auth.service";
import {RestService, User} from "../rest/rest.service";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {DataService} from "../rest/data.service";
import {MatTableDataSource} from "@angular/material/table"
import {MatSort} from "@angular/material/sort"
import {UserEditComponent} from './dialog/user.edit.dialog.component';
import {LOCAL_STORAGE_EMAIL_KEY} from '../pages/login/login.component';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


declare var $:any;
declare var swal: any;

export class Licence {
    licenceId: string;
    startDate: number;
    endDate: number;
    type: string;
    licenceCount: string;
    owner: string;
    status: string;}

@Component({
    moduleId: module.id,
    selector: 'server.settings',
    templateUrl: './server.settings.component.html'
})

@Injectable()
export class ServerSettingsComponent implements  OnDestroy, OnInit, AfterViewInit{

    get messageReceived(): string {
        return this._messageReceived;
    }

    set messageReceived(value: string) {
        this._messageReceived = value;
    }

    public serverSettings: ServerSettings;
    public settingsReceived = false;
    public licenseStatus = "Getting license status";
    public licenseStatusExplaination: string;
    public licenseStatusReceiving = false;
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
    public currentUserType : string = "ADMIN";
    public UserEditing : User;

    public displayedColumnsStreams = ['email', 'type', 'actions'];

    public dataSource: MatTableDataSource<UserInf>; 

    public userDataTable : UserInfoTable;

    public admin_check = false;

    public userListOffset = 0;
    public pageSize = 0;

    public username : string;
    public password : string;
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


    constructor(private http: HttpClient, private route: ActivatedRoute,
                private restService: RestService,
                public dialog: MatDialog,
                private cdr: ChangeDetectorRef,
                public router: Router,private dataService: DataService, private authService: AuthService,) {
    }

    ngOnInit(){
        this.serverSettings = new ServerSettings(null,null, false, this.logLevelInfo,false);

        this.callTimer();
       

        this.userDataTable = {
            dataRows: [],
        };
    }

    ngAfterViewInit() {
        let currentServerJwtStatus =  localStorage.getItem('serverJWTControlEnabled');
        this.restService.isEnterpriseEdition().subscribe(data => {
            this.isEnterpriseEdition = data["success"];
            this.getServerSettings();
        });
        this.restService.isAdmin().subscribe(data => {
            console.log(data);
            // If JWT Server token is enable then no need to check admin status
            if(data["success"] == true || currentServerJwtStatus){
                this.admin_check = true;
            }
            else{
                this.admin_check = false;
            }
        });
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

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.filter = filterValue;
        this.dataSource.filter = filterValue;
    }

    changeType(user: UserInf): void {
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

        console.log("userchange = " + user.email)
        this.UserEditing = new User(user.email, "");
        this.UserEditing.userType= user.userType;

        console.log("UserEditing = " + this.UserEditing.userType)
        if (this.UserEditing) {
            let dialogRef = this.dialog.open(UserEditComponent, {
                data: {
                    email : this.UserEditing.email,
                    type: this.UserEditing.userType,
                },
                width: "400px",
            });

            dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed');
                this.getUserList(this.userListOffset, this.pageSize);
            });
        }
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
        });

    }
    callTimer(){

        console.log("Timer Started");

        this.clearTimer();

        //this timer gets the related information according to active application
        //so that it checks appname whether it is undefined
            this.timerId = window.setInterval(() => {
            if(this.authService.isAuthenticated) {
                this.getUserList(this.userListOffset, this.pageSize);
            }

            }, 5000);
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
            });
        }
    }

    public getLicenseStatus(){

        this.licenseStatusReceiving = true;

        if(this.isEnterpriseEdition){
            this.serverSettings.licenceKey = this.serverSettings.licenceKey.trim();
            this.restService.getLicenseStatus(this.serverSettings.licenceKey ).subscribe(data => {
                this.licenseStatusReceiving = false;
                this.evaluateLicenseStatus(data);
            });

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
            this.restService.changeServerSettings( this.serverSettings).subscribe(data => {
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
            });
        }
    }
    newUser(): void {
        this.username = "";
        this.password = "";
        this.newUserActive = true;
        this.userNameEmpty = false;
        this.User = new User("","")
    }
    UserTypeChanged(event:any){

        if(event == this.AdminUserType) {
            this.currentUserType = this.AdminUserType;
        }
        if(event == this.ReadOnlyUserType) {
            this.currentUserType = this.ReadOnlyUserType;
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
                });
        });

    }

    createUser(isValid: boolean): void {
        console.log("create user called");
        this.userNameEmpty = false;

        if (!isValid) {
            //not valid form return directly
            return;
        }

        this.User.userType = this.currentUserType;

        if (!this.restService.checkStreamName(this.User.email)){
            this.userNameEmpty = true;
            return;
        }

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
            })
            this.newUserCreating = false;
        }
    getServerSettings(): void {
        this.restService.getServerSettings().subscribe(data => {
            this.serverSettings = <ServerSettings>data;
            this.settingsReceived = true;

            if(!this.serverSettings.buildForMarket){
                this.getLastLicenseStatus()
            }

        });
    }

    differenceInDays(firstDate: number, secondDate: number) {
        return Math.round((secondDate-firstDate)/(1000*60*60*24));
    }
}
