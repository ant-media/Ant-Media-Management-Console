import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CanActivate, Router} from '@angular/router';
import {RestService, User} from './rest.service';
import {Licence} from "../server.settings/server.settings.component";
import {ServerSettings} from "../app.page/app.definitions";
import {DatePipe} from '@angular/common';
import * as CryptoJS from 'crypto-js';


declare var swal: any;


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

    public currentLicence : Licence = null;
    public leftDays : number;

    public isEnterpriseEdition = false;


    constructor(private restService: RestService, private router: Router, private datePipe: DatePipe) {

        setInterval(() => {
            this.checkServerIsAuthenticated();

        }, 5000);

        //Check license every 60 seconds minute
        setInterval(() => {
            this.checkLicense();
        }, 60000);

        this.restService.isEnterpriseEdition().subscribe(data => {
            this.isEnterpriseEdition = data["success"];
        });

    }

    public checkLicense() {
        if (this.isAuthenticated) {
            if (this.serverSettings != null && this.isEnterpriseEdition) {
                this.getLicenceStatus(this.serverSettings.licenceKey);
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

        var secretKey = 'gzQ3hKpN4l7tb6SH';

        //var CryptoJS = require('crypto-js');

        var encryptedEmail = CryptoJS.AES.encrypt(email, secretKey).toString();
        var encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

        localStorage.setItem('email', encryptedEmail);
        localStorage.setItem('password', encryptedPassword);

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

        if (localStorage.getItem('authenticated')) {
            this.restService.isAuthenticated().subscribe(data => {

                    this.isAuthenticated = data["success"];

                    if (!this.isAuthenticated) {
                        console.debug("Not authenticated navigating to login ");
                        this.router.navigateByUrl('/pages/login');
                    }
                    if(this.router.url=="/pages/login"){
                        this.router.navigateByUrl('/dashboard/overview');
                    }
                },
                error => {
                    this.isAuthenticated = false;
                    this.router.navigateByUrl('/pages/login');
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
            this.getLicenceStatus(this.serverSettings.licenceKey)
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
                    console.log("Invalid License");

                    if (this.licenceWarningDisplay && !this.serverSettings.buildForMarket) {
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

            });
        }

    }

    differenceInDays(firstDate: number, secondDate: number) {
        return Math.round((secondDate-firstDate)/(1000*60*60*24));
    }

}
