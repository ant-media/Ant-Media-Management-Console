import {Component, OnInit} from '@angular/core';
import {RestService} from '../../rest/rest.service';
import {SupportRestService} from '../../rest/support.service';
import {Router} from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Licence} from "../../server.settings/server.settings.component";
import {AuthService} from "../../rest/auth.service";
import {ServerSettings} from "../../app.page/app.page.component";
import {SupportRequest} from "../../support/support.definitions";


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
    public processCpuLoad: number;
    public liveStreamSize: number;
    public watcherSize: number;
    public diskUsagePercent: any;
    public jvmHeapUsagePercent: any;
    public jvmNativeUsagePercent: any;
    public diskTotalSpace: any;
    public diskInUseSpace: any;
    public jvmHeapTotalSpace: any;
    public jvmHeapInUseSpace: any;
    public systemMemoryInUse: any;
    public systemMemoryTotal: any;
    public jvmNativeInUse: any;
    public jvmNativeMax: any;

    public title : string;
    public description : string;
    public sentSuccess = false;
    public processing = false;

    public isClusterMode = false;





    public cpuLoadIntervalId = 0;
    public systemMemoryUsagePercent = 0;
    public appTableData: TableData;
    public units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    public timerId:any;
    public shutdownTimer:any;
    public licence : Licence;
    public serverSettings : ServerSettings;



    constructor(/*private http: HttpClient,*/private auth: AuthService, private restService:RestService, private supportRestService:SupportRestService, private router:Router, private authService: AuthService) {


    }

    niceBytes(x): string {
        let l = 0, n = parseInt(x, 10) || 0;
        while (n >= 1024) {
            n = n / 1024;
            l++;
        }
        return (n.toFixed(n >= 100 || l < 1 ? 0 : 1) + ' ' + this.units[l]);
    }

    initCirclePercentage() {
        $('#chartDiskUsage,#chartJvmHeapUsage,#chartNativeMemoryUsage,#chartSystemMemory').easyPieChart({
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

        this.restService.isInClusterMode().subscribe(data => {
            this.isClusterMode = data['success'];

            // If it's cluster mode, shouldn't run this feature.
            if(!this.isClusterMode){
                this.shutdownTimer = window.setInterval(() => {
                    this.checkShutdownProperly();
                }, 10000);
            }
        });
    }

    ngOnDestroy() {

        if (this.timerId) {
            clearInterval(this.timerId);
        }

    }

    checkShutdownProperly(): void{
        let appNames = [];
        for( var i = 0; i < this.appTableData.dataRows.length; i++ ){
            appNames.push(this.appTableData.dataRows[i]["name"]);
        }

        if (this.shutdownTimer) {
            clearInterval(this.shutdownTimer);
        }

        this.restService.isShutdownProperly(appNames.join(",")).subscribe(data => {
            //It means doesn't close normal.
            if(data == false){

                swal({
                    title: "Unexpected Shutdown",
                    text: "We detected your Instance was unexpected closed. If you want to review your problem. Please enter your email address to access you",
                    type: 'warning',

                    input: 'email',
                    inputPlaceholder: 'Please enter your email address',

                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes please',
                }).then((value) => {

                    var request = new SupportRequest();

                    request.name = "";
                    request.email = value;
                    request.sendSystemInfo = true;

                    request.title = "In App Shutdown Properly";
                    request.description = "Shutdown error email with logs";

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
                                delay: 5000,
                                placement: {
                                    from: 'top',
                                    align: 'right'
                                }
                            });
                        } else {
                            $.notify({
                                icon: "ti-alert",
                                message: "Your request couldn't be sent. Please try again or send email to contact@antmedia.io"
                            }, {
                                type: 'warning',
                                delay: 5000,
                                placement: {
                                    from: 'top',
                                    align: 'right'
                                }
                            });
                        }
                    });

                }).catch(function () {
                });
                this.restService.setShutdownProperly(appNames.join(",")).subscribe(data => {
                });

            }
        });





        }

    getSystemResources(): void {
        this.restService.getSystemResourcesInfo().subscribe(data => {

            //updateCPULoad

            this.cpuLoad = Number(data["cpuUsage"]["systemCPULoad"]);
            this.processCpuLoad = Number(data["cpuUsage"]["processCPULoad"]);

            this.liveStreamSize = Number(data["totalLiveStreamSize"]);

            //getSystemMemoryInfo
            this.systemMemoryTotal  = Number(data["systemMemoryInfo"]["totalMemory"]);
            this.systemMemoryInUse = Number(data["systemMemoryInfo"]["inUseMemory"]);
            var availableMemory =  Number(data["systemMemoryInfo"]["availableMemory"]);
            if (availableMemory != 0) {
                this.systemMemoryInUse = this.systemMemoryTotal - availableMemory;
            }
            
            this.systemMemoryUsagePercent = Math.round(this.systemMemoryInUse * 100 / this.systemMemoryTotal);
           
            $("#chartSystemMemory").data('easyPieChart').update(this.systemMemoryUsagePercent);
            //getFileSystemInfo

            this.diskInUseSpace = Number(data["fileSystemInfo"]["inUseSpace"]);
            this.diskTotalSpace = Number(data["fileSystemInfo"]["totalSpace"]);
            this.diskUsagePercent = Math.round(this.diskInUseSpace * 100 / this.diskTotalSpace);

            $("#chartDiskUsage").data('easyPieChart').update(this.diskUsagePercent);
         
             //getJVMNativeUsage

             this.jvmNativeInUse = Number(data["jvmNativeMemoryUsage"]["inUseMemory"]);
             this.jvmNativeMax = Number(data["jvmNativeMemoryUsage"]["maxMemory"]);
             this.jvmNativeUsagePercent = Math.round(Number(this.jvmNativeInUse * 100 / this.jvmNativeMax));

            // $("#chartJVMNativeUsage").data('easyPieChart').update(this.jvmNativeUsagePercent);

             //getJvmHeapUsage

             this.jvmHeapInUseSpace = Number(data["jvmMemoryUsage"]["inUseMemory"]);
             this.jvmHeapTotalSpace = Number(data["jvmMemoryUsage"]["maxMemory"]);
             this.jvmHeapUsagePercent = Math.round(Number(this.jvmHeapInUseSpace * 100 / this.jvmHeapTotalSpace));

             $("#chartJvmHeapUsage").data('easyPieChart').update(this.jvmHeapUsagePercent);

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
