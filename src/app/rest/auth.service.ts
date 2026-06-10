import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CanActivate, Router} from '@angular/router';
import {RestService, User, show403Error} from './rest.service';
import {ServerSettings,Licence} from "../app.page/app.definitions";
import {DatePipe} from '@angular/common';

declare var swal: any;
declare var $: any;
export var isScopeSystem = function(scope) {
    return scope == "" || scope == null || scope == "null" || scope == "system";
}



@Injectable()
export class AuthService implements CanActivate {

    /**
     * isAuthenticated is called in every 5 seconds to check if it's authenticated.
     * If it's unauthenticated, it natigates to login
     * It's true by default. Here is the explanation.
     * When page is refreshed, authenticated user is navigating to login
     * because it's not updated yet.
     */
    public isAuthenticated: boolean = true;

    public serverSettings: ServerSettings;

    public user: User;

    public licenceWarningDisplay = true;

    public currentLicence : Licence;
    public leftDays : number;

    public isEnterpriseEdition = false;


    constructor(private restService: RestService, private router: Router, private datePipe: DatePipe) {

        this.currentLicence = new Licence("",null,null,null,null,null,null);

        setInterval(() => {
            this.checkServerIsAuthenticated();

        }, 5000);

        //Check license every 300 seconds 5 minutes
        setInterval(() => {
            this.checkLicense();
        }, 300000);
         
    }

    public checkLicense() {
        //let scope  = localStorage.getItem(LOCAL_STORAGE_SCOPE_KEY);
        var appNameUserTypeStr = localStorage.getItem(APP_NAME_USER_TYPE);
        if(appNameUserTypeStr == null || appNameUserTypeStr == ""){
            console.log("Cant check license because user app permissions are empty/null.")
            return;
        }

        var appNameUserTypeJson = JSON.parse(appNameUserTypeStr)

        if (this.isAuthenticated && "system" in appNameUserTypeJson) 
        {
            if (this.serverSettings != null) 
            {
                this.restService.isEnterpriseEdition().subscribe(data => 
                {
                    this.isEnterpriseEdition = data["success"];
                    if (this.isEnterpriseEdition) {
                        this.getLicenceStatus(this.serverSettings.licenceKey);
                    }
                }, error => { 
                    show403Error(error);
                 });
                
            } else {
                this.getServerSettings();
            }
        }
    }

    initLicenseCheck() {
        //check first after initialized in 5 seconds 
        setTimeout(() => {
            this.checkLicense();
        }, 5000);

    }

    login(email: string, password: string): Observable<Object> {

        this.user = new User(email, password);

        return this.restService.authenticateUser(this.user);
    }

    changeUserPassword(email: string, password: string, newPassword: string): Observable<Object> {
        let user = new User(email, password);
        user.newPassword = newPassword;
        return this.restService.changePassword(user);
    }

    isFirstLogin(): Observable<Object> {
        return this.restService.isFirstLogin();
    }

    createFirstAccount(user: User): Observable<Object> {
        return this.restService.createFirstAccount(user);
    }

    checkServerIsAuthenticated(): void {

        if (localStorage.getItem('authenticated')) 
        {
            this.restService.isAuthenticated().subscribe(data => {

                    this.isAuthenticated = data["success"];

                    if (!this.isAuthenticated) {
                        console.debug("Not authenticated navigating to login ");
                        this.router.navigateByUrl('/pages/login');
                    }
                    if(this.router.url=="/pages/login"){
                        //let scope = localStorage.getItem(LOCAL_STORAGE_SCOPE_KEY);
                        var appNameUserTypeStr = localStorage.getItem(APP_NAME_USER_TYPE);
                        if(appNameUserTypeStr == null || appNameUserTypeStr == ""){
                            return;
                        }
                        var appNameUserTypeJson = JSON.parse(appNameUserTypeStr)



                        if ("system" in appNameUserTypeJson) {
                            this.router.navigateByUrl('/dashboard/overview');
                        }
                        else {
                            this.router.navigateByUrl('/applications/' + Object.keys(appNameUserTypeJson)[0]);
                        }
                    }
                },
                error => {
                    this.isAuthenticated = false;
                    this.router.navigateByUrl('/pages/login');
                    show403Error(error);
                });
        }
        else{
            this.isAuthenticated = false;
        }
    }

    canActivate(): boolean {
        console.debug("AuthService: is authenticated: " + this.isAuthenticated
            + " local storage: " + localStorage.getItem('authenticated'));

        if (localStorage.getItem('authenticated') && this.isAuthenticated) {

            this.restService.isAuthenticated().subscribe(data => {

                    this.isAuthenticated = data["success"];

                    if (!this.isAuthenticated) {
                        this.router.navigateByUrl('/pages/login');
                    }
                    if(this.router.url=="/pages/login"){
                        this.router.navigateByUrl('/dashboard/overview');
                    }
                },
                error => {
                    this.isAuthenticated = false;
                    this.router.navigateByUrl('/pages/login');
                    show403Error(error);
                });
            return true;
        }
        else {
            console.debug("AuthService navigating login")
            this.router.navigateByUrl('/pages/login');
            this.isAuthenticated = false;
            return false;
        }

    }

    getServerSettings ()
    {
        this.restService.getServerSettings().subscribe(data => {
            this.serverSettings = <ServerSettings>data;
            localStorage.setItem('hostAddress', data["hostAddress"]);
            this.getLicenceStatus(this.serverSettings.licenceKey)
        }, error => { 
            show403Error(error); 
        });
    }


    getLicenceStatus (key: string) : any {

        this.currentLicence = null;
        if(this.isEnterpriseEdition) {
            this.restService.getLicenseStatus(key).subscribe(data => {

                this.currentLicence = <Licence>data;
                if (this.currentLicence != null && this.currentLicence.licenceId != null) {

                    let end = this.currentLicence.endDate;

                    this.leftDays = this.differenceInDays(new Date().getTime(), new Date(end).getTime());

                    if (this.leftDays < 3 && this.licenceWarningDisplay) {

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

                        this.licenceWarningDisplay = false;

                    }

                    return this.currentLicence;
                } else {

                    if (this.licenceWarningDisplay && !this.serverSettings.buildForMarket) {
                        console.log("Invalid License");
                        swal({
                            title: "Invalid License",
                            text: "Please Validate Your License ",
                            type: 'error',

                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'OK',

                            onClose: function () {

                            }
                        }).then(() => {
                            window.location.href = "/#/serverSettings";

                        }).catch(function () {

                        });
                    }
                    this.licenceWarningDisplay = false;
                    return null;
                }

            }, error => { show403Error(error); });
        }

    }

    differenceInDays(firstDate: number, secondDate: number) {
        return Math.round((secondDate-firstDate)/(1000*60*60*24));
    }

}

export const LOCAL_STORAGE_EMAIL_KEY = "email";
export const LOCAL_STORAGE_SCOPE_KEY = "scope";
export const LOCAL_STORAGE_ROLE_KEY = "role";
export const APP_NAME_USER_TYPE = "appNameUserType";
