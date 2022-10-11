import {Component, OnInit} from '@angular/core';
import {RestService} from '../rest/rest.service';
import {Router} from '@angular/router';
import { show403Error } from 'app/rest/rest.service';


declare var $: any;
declare var Chartist: any;


@Component({
    moduleId: module.id,
    selector: 'logs-cmp',
    templateUrl: './logs.component.html'
})

export class LogsComponent implements OnInit {


    public logFileText: string;

    constructor(private restService:RestService, private router:Router) { }

    public textConsoleLog : string = "ConsoleLog";
    public textErrorLog : string = "ErrorLog";

    public serverLogType : string = "server";
    public errorLogType : string = "error";

    public activeLogType: string;

    public logFileOffset: number = -1;

    public timerId: any;

    ngOnInit() {
        //make activeLogType serverLogType by default 
        this.activeLogType = this.serverLogType;

        this.timerId = window.setInterval(() => {
            this.getConsoleLogFile();
        }, 10000);
    }

    ngAfterViewInit() {
        this.getConsoleLogFile();
    }

    ngOnDestroy() {
        clearInterval(this.timerId);
    }

    getConsoleLogFile (): void{

        this.restService.getLogFile(this.logFileOffset, this.activeLogType).subscribe(data => {
            this.logFileText += data["logContent"];
            if (this.logFileOffset == -1) {
                //this mean end of file is requested
                if (data["logFileSize"] > 0) {
                    this.logFileOffset = data["logFileSize"];
                }
            }
            else {
                this.logFileOffset +=  data["logContentSize"];
            }
        }, error => { show403Error(error); });

    }


    logChanged(event:any){

        this.logFileOffset = -1;
        this.logFileText = "";
        if(event == this.textConsoleLog) {
            this.activeLogType = this.serverLogType;
        }
        if(event == this.textErrorLog){
            this.activeLogType = this.errorLogType;  
        }
        this.getConsoleLogFile();
    }


    isMobileMenu() {
        if ($(window).width() > 991) {
            return true;
        }
        return false;
    }
}
