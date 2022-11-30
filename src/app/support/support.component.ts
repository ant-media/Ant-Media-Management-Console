import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {SupportRestService} from '../rest/support.service';
import {RestService} from '../rest/rest.service';
import {Locale} from "../locale/locale";
import {
    MatDialog
} from '@angular/material/dialog';
import {
    MatPaginatorIntl
} from '@angular/material/paginator';
import { NgForm } from '@angular/forms';
import "rxjs/add/operator/toPromise";
import {
    SupportRequest
} from './support.definitions';
import { show403Error } from 'app/rest/rest.service';

declare var $: any;
declare var Chartist: any;
declare var swal: any;
declare var classie: any;

declare function require(name: string);


@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})


export class SupportComponent implements OnInit, OnDestroy, AfterViewInit {

    public timerId: any;
    public userName : string;
    public userEmail : string;
    public title : string;
    public description : string;
    public sendSystemInfo : boolean;
    public isEnterpriseEdition = false;
    public isMarketBuild = false;
    public sentSuccess = false;
    public processing = false;

    constructor(private http: HttpClient, 
    			private route: ActivatedRoute,
                private supportRestService: SupportRestService,
                private restService: RestService,
                private renderer: Renderer2,
                public router: Router,
                public dialog: MatDialog,
                private cdr: ChangeDetectorRef,
                private matpage: MatPaginatorIntl,
    ) {

    }

    ngOnInit() {
        this.restService.isEnterpriseEdition().subscribe(data => {
            this.isEnterpriseEdition = data["success"];
        }, error => { show403Error(error); });
        
        this.restService.getServerSettings().subscribe(data => {
            this.isMarketBuild = data["buildForMarket"];
        }, error => { //don't show 403 error because redundant
         });
    }

    ngAfterViewInit() 
    {

    }

    ngOnDestroy() {
    }
    
    sendRequest(requestForm: NgForm): void {
        if (!requestForm.valid) {
            return;
        }

        var request = new SupportRequest();
        
        request.name = this.userName;
        request.email = this.userEmail;
        request.title = this.title;
        request.description = this.description;
        request.sendSystemInfo = this.sendSystemInfo;

        this.processing = true;
        
        this.supportRestService.sendRequest(request).subscribe(data => {
            this.processing = false;
            if (data["success"] == true) {
                this.sentSuccess = true;
                $.notify({
                    icon: "ti-email",
                    message: "Your request has been sent. Support team will contact through your e-mail soon."
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
                    message: "Your request couldn't be sent. Please try again or send email to support@antmedia.io"
                }, {
                    type: 'warning',
                    delay: 1900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
        },
        error=> {
            show403Error(error);
            if (!error && error.status != 403) {
                $.notify({
                    icon: "ti-alert",
                    message: "Your request couldn't be sent. Please try again or send email to support@antmedia.io"
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




