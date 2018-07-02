import {AfterViewInit, ChangeDetectorRef, Component, Injectable, NgZone, OnInit, Renderer} from '@angular/core';
import {ServerSettings} from "../app.page/app.page.component";
import {Locale} from "../locale/locale";
import {AuthService} from "../rest/auth.service";
import {MatDialog, MatPaginatorIntl, MatTableDataSource} from "@angular/material";
import {ClipboardService} from "ngx-clipboard";
import {BroadcastInfo, VodInfo} from "../app.page/app.definitions";
import {RestService} from "../rest/rest.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";
import {DataService} from "../rest/data.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


declare var $:any;
declare var swal: any;

export class Licence {
    licenceId: string;
    startDate: string;
    endDate: string;
    type: string;
    licenceCount: string;
    owner: string;}

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
    public licenseStatus = "invalid";
    public licenseStatusReceiving = false;
    public currentLicence : Licence;
    private _messageReceived : string;
    public timerId: any;
    public displayWarning = true;



    constructor(private http: HttpClient, private route: ActivatedRoute,
                private restService: RestService,
                public router: Router,private dataService: DataService, private authService: AuthService,) {



    }


    ngOnInit(){

        this.serverSettings = new ServerSettings(null,"key");
        this.getServerSettings();


    }

    ngAfterViewInit() {

        if (this.authService.isAuthenticated) {

            setTimeout(() => {

                this.timerId = window.setInterval(() => {

                    this.getLicenseStatus()

                }, 6000);

            }, 5000)

        }
    }

    ngOnDestroy() {


    }



    public getLicenseStatus(){

        this.licenseStatusReceiving = false;
        this.restService.getLicenseStatus( ).subscribe(data => {
            if (data != null) {
                this.licenseStatus = "valid";
                this.currentLicence= <Licence>data;
                console.log(data);

            }
            else {

                this.licenseStatus = "invalid";
                console.log("invalid license")

                if (this.displayWarning) {

                    swal({
                        title: "Invalid License",
                        text: "Please Validate Your License ",
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

            this.displayWarning = false;
        });

        return this.currentLicence;

    }

    changeServerSettings(isValid : boolean): void {

        if (!isValid) {
            return;
        }
        this.licenseStatusReceiving = true;
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

        setTimeout(()=>{

            this.getLicenseStatus();

        },9000)


    }

    getServerSettings(): void {
        this.restService.getServerSettings().subscribe(data => {
            this.serverSettings = <ServerSettings>data;

            console.log(data);

        });
        this.settingsReceived = true;

    }


}
