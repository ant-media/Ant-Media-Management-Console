import {AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit, Renderer} from '@angular/core';
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

declare var $:any;

@Component({
    moduleId: module.id,
    selector: 'charts-cmp',
    templateUrl: './server.settings.component.html'
})



export class ServerSettingsComponent implements OnInit, AfterViewInit{

    public serverSettings: ServerSettings;
    public settingsReceived = false;
    public licenseStatus = "invalid";
    public licenseStatusReceiving = false;
    public licenseInfo;


    constructor(private http: HttpClient, private route: ActivatedRoute,
                private restService: RestService,

                public router: Router,



    ) {}


    ngOnInit(){

        this.serverSettings = new ServerSettings(null,"key");
        this.getServerSettings();
        this.getLicenseStatus();


    }

    ngAfterViewInit() {

    }


    getLicenseStatus(){

        this.licenseStatusReceiving = false;
        this.restService.getLicenseStatus( ).subscribe(data => {
            if (data["success"] == true) {
                this.licenseStatus = "valid";
                this.licenseInfo= data["message"];


            }
            else {
                this.licenseStatus = "invalid";


            }
        });



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

        },8000)


    }

    getServerSettings(): void {
        this.restService.getServerSettings().subscribe(data => {
            this.serverSettings = <ServerSettings>data;

        });
        this.settingsReceived = true;

    }


}
