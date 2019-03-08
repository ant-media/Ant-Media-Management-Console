import {Component, OnInit} from '@angular/core';
import {RestService} from '../../rest/rest.service';
import {Router} from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Licence} from "../../server.settings/server.settings.component";
import {AuthService} from "../../rest/auth.service";
import {ServerSettings} from "../../app.page/app.page.component";


declare var $: any;
declare var Chartist: any;
declare var swal: any;


declare interface AppInfo {
    name: string;
    liveStreamCount: number;
    vodCount: number;
    storage: number;
}

declare interface TableData {
    dataRows: AppInfo[];
}

@Component({
    selector: 'overview-cmp',
    templateUrl: './overview.component.html'
})

export class OverviewComponent implements OnInit {

    public cpuLoad: number;
    public liveStreamSize: number;
    public watcherSize: number;
    public chartSystemMemory: any;
    public diskUsagePercent: any;
    public memoryUsagePercent: any;
    public diskTotalSpace: any;
    public diskInUseSpace: any;
    public memoryTotalSpace: any;
    public memoryInUseSpace: any;
    public systemMemoryInUse: any;
    public systemMemoryTotal: any;

    public cpuLoadIntervalId = 0;
    public systemMemoryUsagePercent = 0;
    public appTableData: TableData;
    public units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    public timerId:any;
    public licence : Licence;
    public serverSettings : ServerSettings;



    constructor(/*private http: HttpClient,*/private auth: AuthService, private restService:RestService, private router:Router, private authService: AuthService) {


    }

    niceBytes(x): string {
        let l = 0, n = parseInt(x, 10) || 0;
        while (n >= 1000) {
            n = n / 1000;
            l++;
        }
        return (n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + this.units[l]);
    }

    initCirclePercentage() {
        $('#chartSystemMemory, #chartDiskUsage, #chartMemoryUsage').easyPieChart({
            lineWidth: 9,
            size: 160,
            scaleColor: false,
            trackColor: '#BBDEFB',
            barColor: '#1565C0',
            animate: false,
        });
    }

    ngOnInit() {
        this.appTableData = {
            dataRows: [
            ]
        };



    }
    ngAfterViewInit() {

        this.initCirclePercentage();
        this.getSystemResources(); // All in One
        this.getApplicationsInfo();
        this.timerId = window.setInterval(() => {
            this.getSystemResources(); // All in One
            this.getApplicationsInfo();
        }, 5000);

        this.auth.initLicenseCheck();


    }

    ngOnDestroy() {

        if (this.timerId) {
            clearInterval(this.timerId);
        }

    }

    getSystemResources(): void {
        this.restService.getSystemResourcesInfo().subscribe(data => {

            //updateCPULoad

            this.cpuLoad = Number(data["cpuUsage"]["systemCPULoad"]);
            this.liveStreamSize = Number(data["totalLiveStreamSize"]);

            //getSystemMemoryInfo

            this.systemMemoryInUse = Number(data["systemMemoryInfo"]["inUseMemory"]);
            this.systemMemoryTotal  = Number(data["systemMemoryInfo"]["totalMemory"]);
            this.systemMemoryUsagePercent = Math.round(this.systemMemoryInUse * 100 / this.systemMemoryTotal);

            //getFileSystemInfo

            this.diskInUseSpace = Number(data["fileSystemInfo"]["inUseSpace"]);
            this.diskTotalSpace = Number(data["fileSystemInfo"]["totalSpace"]);
            this.diskUsagePercent = Math.round(this.diskInUseSpace * 100 / this.diskTotalSpace);

            $("#chartDiskUsage").data('easyPieChart').update(this.diskUsagePercent);

            //getJVMMemoryInfo

             this.memoryInUseSpace = Number(data["jvmMemoryUsage"]["inUseMemory"]);
             this.memoryTotalSpace = Number(data["jvmMemoryUsage"]["maxMemory"]);
             this.memoryUsagePercent = Math.round(Number(this.memoryInUseSpace * 100 / this.memoryTotalSpace));

             $("#chartMemoryUsage").data('easyPieChart').update(this.memoryUsagePercent);

        },
            this.handleError);
    }

    handleError(error:Response) {

        console.log("error status: " + error.status);
        if (error.status == 401) {
            console.log(this.router);
            //this.router.navigateByUrl("/pages/login");
        }

    }

    getApplicationsInfo(): void {
        this.restService.getApplicationsInfo().subscribe(data => {
            this.appTableData.dataRows = [];
            for (var i in data) {
                this.appTableData.dataRows.push(data[i]);
            }
        });
    }

    isMobileMenu() {
        if ($(window).width() > 991) {
            return true;
        }
        return false;
    }
}
