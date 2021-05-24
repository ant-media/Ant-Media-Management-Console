import {AfterViewInit, Component, Injectable, OnInit} from '@angular/core';
import {ServerSettings} from "../app.page/app.definitions";
import {Locale} from "../locale/locale";
import {AuthService} from "../rest/auth.service";
import {RestService} from "../rest/rest.service";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {DataService} from "../rest/data.service";

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
export class ServerSettingsComponent implements OnInit, AfterViewInit{

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

    public allLicensesUsedError : string = "ALL_LICENSES_ARE_USED";
    public noLicenseFounrError: string = "NO_LICENSE_FOUND";
    public licenseExpireError : string = "LICENSE_EXPIRED";
    public licenseServerRequestError : string = "serverRequestError";
    public invalidKeyError: string = "INVALID_KEY";
    public licenseBlocked: string = "LICENSE_BLOCKED";

    public TRIAL_PERIOD_ENDED: string = "TRIAL_PERIOD_ENDED";

    constructor(private http: HttpClient, private route: ActivatedRoute,
                private restService: RestService,
                public router: Router,private dataService: DataService, private authService: AuthService,) {
    }

    ngOnInit(){

        this.serverSettings = new ServerSettings(null,null, false);

        this.getLogLevel();

    }

    ngAfterViewInit() {
        this.restService.isEnterpriseEdition().subscribe(data => {
            this.isEnterpriseEdition = data["success"];
            this.getServerSettings();
        });
    }

    ngOnDestroy() {

    }

    public getLogLevel(){

        this.restService.getLogLevel().subscribe(data => {

            this.currentLogLevel = data['logLevel'];

        });
    }

    logLevelChanged(event:any){

        if(event == this.logLevelInfo) {
            this.currentLogLevel = this.logLevelInfo;
        }
        if(event == this.logLevelWarn) {
            this.currentLogLevel = this.logLevelWarn;
        }
        if(event == this.logLevelError) {
            this.currentLogLevel = this.logLevelError;
        }
        if(event == this.logLevelOff) {
            this.currentLogLevel = this.logLevelOff;
        }
    }

    changeLogLevel(valid: boolean): void {

        if (!valid) {
            return;
        }

        this.restService.changeLogLevel(this.currentLogLevel).subscribe(data => {
            if (data["success"] == true) {
                $.notify({
                    icon: "ti-save",
                    message: Locale.getLocaleInterface().settings_saved
                }, {
                    type: "success",
                    delay: 900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            } else {
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
        this.restService.changeServerSettings( this.serverSettings).subscribe(data => {
            if (data["success"] == true) {
                $.notify({
                    icon: "ti-save",
                    message: Locale.getLocaleInterface().settings_saved
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
