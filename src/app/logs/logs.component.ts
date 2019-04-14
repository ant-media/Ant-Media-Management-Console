import {Component, OnInit} from '@angular/core';
import {RestService} from '../rest/rest.service';
import {Router} from '@angular/router';


declare var $: any;
declare var Chartist: any;


@Component({
    selector: 'logs-cmp',
    templateUrl: './logs.component.html'
})

export class LogsComponent implements OnInit {


    public logFileText: any;

    constructor(private restService:RestService, private router:Router) { }

    public textConsoleLog : String = "ConsoleLog";
    public textErrorLog : String = "ErrorLog";


    ngOnInit() {
    }
    ngAfterViewInit() {
        this.getConsoleLogFile();
    }

    ngOnDestroy() {
    }

    getConsoleLogFile (): void{

        this.restService.getConsoleLogFile().subscribe(data => {

            this.logFileText = data;

        });

    }


    logChanged(event:any){

        if(event == this.textConsoleLog) {

            this.restService.getConsoleLogFile().subscribe(data => {

                this.logFileText = data;

            });

        }

        if(event == this.textErrorLog){

            this.restService.getErrorLogFile().subscribe(data => {

                this.logFileText = data;

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
