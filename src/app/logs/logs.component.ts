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

    public serverLogType : string = "";
    public errorLogType : string = "error";

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.getConsoleLogFile();
    }

    ngOnDestroy() {
    }

    getConsoleLogFile (): void{

        this.restService.getLogFile(this.serverLogType).subscribe(data => {

            this.logFileText = data["logContent"];

        });

    }


    logChanged(event:any){

        if(event == this.textConsoleLog) {

            this.restService.getLogFile(this.serverLogType).subscribe(data => {

                this.logFileText = data["logContent"];

            });

        }

        if(event == this.textErrorLog){

            this.restService.getLogFile(this.errorLogType).subscribe(data => {

                this.logFileText = data["logContent"];

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
