import { Component, OnInit } from '@angular/core';
import { RestService } from '../rest/rest.service';
import { Router } from '@angular/router';


declare var $: any;
declare var Chartist: any;


@Component({
    selector: 'logs-cmp',
    templateUrl: './logs.component.html'
})

export class LogsComponent implements OnInit {


    public LogFileText: any;

    constructor(private restService:RestService, private router:Router) { }

    ngOnInit() {
    }
    ngAfterViewInit() {
        this.getConsoleLogFile();
    }

    ngOnDestroy() {
    }

    getConsoleLogFile (): void{

        this.restService.getConsoleLogFile().subscribe(data => {

            this.LogFileText = data;

        });

    }


    logChanged(event:any){

        if(event == "ConsoleLog") {

            this.restService.getConsoleLogFile().subscribe(data => {

                this.LogFileText = data;

            });

        }

        if(event == "ErrorLog"){

            this.restService.getErrorLogFile().subscribe(data => {

                this.LogFileText = data;

            });

        }


    }


    isMobileMenu() {
        if ($(window).width() > 991) {
            return true;
        }
        return false;
    }
}