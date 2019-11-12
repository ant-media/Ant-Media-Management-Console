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
    Renderer,
    ViewChild,
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {SupportRestService} from '../rest/support.service';
import {Locale} from "../locale/locale";
import {
    MatDialog,
    MatPaginatorIntl,
    MatSort,
    MatTableDataSource,
    PageEvent
} from '@angular/material';
import { NgForm } from '@angular/forms';
import "rxjs/add/operator/toPromise";
import {
    SupportRequest
} from './support.definitions';

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
    constructor(private http: HttpClient, 
    			private route: ActivatedRoute,
                private supportRestService: SupportRestService,
                private renderer: Renderer,
                public router: Router,
                public dialog: MatDialog,
                private cdr: ChangeDetectorRef,
                private matpage: MatPaginatorIntl,
    ) {

    }

    ngOnInit() {

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
        
        request.name = requestForm.form.value['userName'];
        request.email = requestForm.form.value['userEmail'];
        request.title = requestForm.form.value['title'];
        request.description = requestForm.form.value['description'];
        request.sendSystemInfo = requestForm.form.value['sendSysInfo'];
        
        this.supportRestService.sendRequest(request).subscribe(data => {
            if (data["success"] == true) {
                $.notify({
                    icon: "ti-email",
                    message: "Request Sent"
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
                    message: "Request couln't be sent"
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




