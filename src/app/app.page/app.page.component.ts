import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    Renderer,
    ViewChild
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {HTTP_SERVER_ROOT, LiveBroadcast, RestService} from '../rest/rest.service';
import {AuthService} from '../rest/auth.service';
import {ClipboardService} from 'ngx-clipboard';
import {Locale} from "../locale/locale";
import {MatDialog, MatPaginatorIntl, MatSort, MatTableDataSource, PageEvent} from '@angular/material';
import "rxjs/add/operator/toPromise";

import {
    BroadcastInfo,
    BroadcastInfoTable,
    CameraInfoTable,
    EncoderSettings,
    VideoServiceEndpoint,
    VodInfo,
    VodInfoTable
} from './app.definitions';
import {DetectedObjectListDialog} from './dialog/detected.objects.list';
import {UploadVodDialogComponent} from './dialog/upload-vod-dialog';
import {StreamSourceEditComponent} from './dialog/stream.source.edit.component';
import {BroadcastEditComponent} from './dialog/broadcast.edit.dialog.component';
import {CamSettingsDialogComponent} from './dialog/cam.settings.dialog.component';
import {SocialMediaStatsComponent} from './dialog/social.media.stats.component';
import {WebRTCClientStatsComponent} from './dialog/webrtcstats/webrtc.client.stats.component';
import {Observable} from "rxjs";
import "rxjs/add/observable/of";

declare var $: any;
declare var Chartist: any;
declare var swal: any;
declare var classie: any;


const ERROR_SOCIAL_ENDPOINT_UNDEFINED_CLIENT_ID = -1;
const ERROR_SOCIAL_ENDPOINT_UNDEFINED_ENDPOINT = -2;

declare function require(name: string);
var flowplayer = require('flowplayer');
var engine = require('flowplayer-hlsjs');
engine(flowplayer);

const LIVE_STREAMING_NOT_ENABLED = "LIVE_STREAMING_NOT_ENABLED";
const AUTHENTICATION_TIMEOUT = "AUTHENTICATION_TIMEOUT";

export class HLSListType {
    constructor(public name: string, public value: string) {
    }
}

export class Camera {
    constructor(
        public name: string,
        public ipAddr: string,
        public username: string,
        public password: string,
        public streamUrl: string,
        public type: string) { }
}

export class AppSettings {

    constructor(public mp4MuxingEnabled: boolean,
                public addDateTimeToMp4FileName: boolean,
                public hlsMuxingEnabled: boolean,
                public hlsListSize: number,
                public hlsTime: number,
                public hlsPlayListType: string,
                public facebookClientId: string,
                public facebookClientSecret: string,
                public youtubeClientId: string,
                public youtubeClientSecret: string,
                public periscopeClientId: string,
                public periscopeClientSecret: string,
                public encoderSettings: EncoderSettings[],
                public acceptOnlyStreamsInDataStore: boolean,
                public vodFolder: string,
                public objectDetectionEnabled: boolean,
                public tokenControlEnabled:boolean,
                public webRTCEnabled:boolean,
                public webRTCFrameRate:number,
                public remoteAllowedCIDR: string
    ) {

    }
}

export class SocialNetworkChannel {
    public type: string;
    public name: string;
    public id: string;
}

export class SearchParam {
    public keyword: string;
    public startDate: number;
    public endDate: number;
}

export class Token {
    public tokenId: string;
    public streamId: string;
    public expireDate: number;
    public type:string;
}

@Component({
    selector: 'manage-app-cmp',
    moduleId: module.id,
    templateUrl: 'app.page.component.html',
    styleUrls: ['app.page.component.css'],


})


export class AppPageComponent implements OnInit, OnDestroy, AfterViewInit {

    public appName: string;
    public sub: any;
    public broadcastTableData: BroadcastInfoTable;
    public broadcastGridTableData: BroadcastInfoTable;
    public broadcastTempTable: BroadcastInfoTable;

    public gridTableData: CameraInfoTable;
    public vodTableData: VodInfoTable;
    public timerId: any;
    public camereErrorTimerId:any;
    public checkAuthStatusTimerId: any;
    public newLiveStreamActive: boolean;
    public newIPCameraActive: boolean;
    public newStreamSourceActive: boolean;
    public liveBroadcast: LiveBroadcast;
    public liveBroadcastShareFacebook: boolean;
    public liveBroadcastShareYoutube: boolean;
    public liveBroadcastSharePeriscope: boolean;
    public newLiveStreamCreating = false;
    public newIPCameraAdding = false;
    public newStreamSourceAdding = false;
    public newStreamSourceWarn = false;
    public discoveryStarted = false;
    public newSourceAdding = false;
    public isEnterpriseEdition = false;

    public gettingDeviceParameters = false;
    public waitingForConfirmation = false;

    public camera: Camera;
    public onvifURLs: String[];
    public newOnvifURLs: String[];
    public broadcastList: CameraInfoTable;
    public noCamWarning = false;
    public isGridView = false;
    public keyword: string;
    public startDate: string;
    public endDate: string;
    public requestedStartDate: number;
    public requestedEndDate: number;
    public searchWarning = false;
    public searchParam: SearchParam;
    public selectedBroadcast: LiveBroadcast;
    public showVodButtons = false;

    public userFBPagesLoading = false;
    public liveStreamEditing: LiveBroadcast;
    public editBroadcastShareYoutube: boolean;
    public editBroadcastShareFacebook: boolean;
    public editBroadcastSharePeriscope: boolean;
    public liveStreamUpdating = false;
    public shareEndpoint: boolean[];
    public videoServiceEndpoints: VideoServiceEndpoint[];
    public streamUrlValid = true;
    public streamNameEmpty=false;
    public encoderSettings:EncoderSettings[];
    public acceptAllStreams : boolean;




    public appSettings: AppSettings; // = new AppSettings(false, true, true, 5, 2, "event", "no clientid", "no fb secret", "no youtube cid", "no youtube secre", "no pers cid", "no pers sec");
    public token:Token;
    public listTypes = [
        new HLSListType('None', ''),
        new HLSListType('Event', 'event'),
    ];

    public displayedColumnsStreams = ['name', 'streamId' , 'status', 'viewerCount', 'social_media', 'actions'];
    public displayedColumnsVod = ['name', 'type', 'date', 'actions'];
    public displayedColumnsUserVod = ['name', 'date', 'actions'];

    public dataSource: MatTableDataSource<BroadcastInfo>;

    public dataSourceVod: MatTableDataSource<VodInfo>;

    public streamsPageSize = 10;
    public vodPageSize = 10;
    public pageSize = 10;
    public pageSizeOptions = [10, 25, 50];

    public streamsLength: number;
    public vodLength: any;
    public userVodLength: any;
    public gridLength: any;
    public listLength: any;

    public streamListOffset = 0;
    public vodListOffset = 0;

    public importingLiveStreams = false;
    public importingVoDStreams = false;
    private tokenData: Observable<Token>;
    // MatPaginator Output

    @Input() pageEvent: PageEvent;

    @Output()
    pageChange: EventEmitter<PageEvent>;

    @ViewChild(MatSort) sort: MatSort;


    constructor(private route: ActivatedRoute,
                private restService: RestService,
                private clipBoardService: ClipboardService,
                private renderer: Renderer,
                public router: Router,
                private zone: NgZone,
                public dialog: MatDialog,
                public sanitizer: DomSanitizer,
                private cdr: ChangeDetectorRef,
                private matpage: MatPaginatorIntl,
                private authService: AuthService,


    ) {
        this.dataSource = new MatTableDataSource<BroadcastInfo>();
        this.dataSourceVod = new MatTableDataSource<VodInfo>();

    }

    setPageSizeOptions(setPageSizeOptionsInput: string) {
        this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }

    ngOnInit() {

        this.timerId = null;

        //  Init Bootstrap Select Picker
        if ($(".selectpicker").length != 0) {
            $(".selectpicker").selectpicker({
                iconBase: "ti",
                tickIcon: "ti-check"
            });
        }

        $('.datepicker').datetimepicker({
            format: 'YYYY-MM-DD', //use this format if you want the 12hours timpiecker with AM/PM toggle
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-chevron-up",
                down: "fa fa-chevron-down",
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
        });

        var self = this;

        this.zone.run(() => {


            $('#selectBox').change(function () {

                var val = $(this).val();
                console.log(val);

                self.filterAppLiveStreams(val);

            });

        });

        this.broadcastTableData = {
            dataRows: [],
        };

        this.gridTableData = {
            list: []
        };

        this.vodTableData = {
            dataRows: []
        };

        this.broadcastTempTable = {
            dataRows: [],
        };

        this.broadcastGridTableData = {
            dataRows: [],
        };

        this.liveBroadcast = new LiveBroadcast();
        this.selectedBroadcast = new LiveBroadcast();
        this.liveBroadcast.name = "";
        this.liveBroadcast.type = "";
        this.liveBroadcastShareFacebook = false;
        this.liveBroadcastShareYoutube = false;
        this.liveBroadcastSharePeriscope = false;
        this.searchParam = new SearchParam();
        this.appSettings = null;
        this.token = null;
        this.newLiveStreamActive = false;
        this.camera = new Camera("", "", "", "", "", "");

        this.getInitParams();


        //this timer gets the related information according to active application
        //so that it checks appname whether it is undefined
        this.timerId = window.setInterval(() => {
            if(this.authService.isAuthenticated) {
                if(this.appName != "undefined"){

                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getVoDStreams();
                    this.getAppLiveStreamsNumber();
                }
            }

        }, 5000);
    }

    onPaginateChange(event) {


        console.log("page index:" + event.pageIndex);
        console.log("length:" + event.length);
        console.log("page size:" + event.pageSize);

        this.vodListOffset = event.pageIndex * event.pageSize;

        this.pageSize = event.pageSize;

        this.keyword = null;

        this.restService.getVodList(this.appName, this.vodListOffset, this.pageSize).subscribe(data => {
            this.vodTableData.dataRows = [];
            for (var i in data) {
                this.vodTableData.dataRows.push(data[i]);
            }

            this.dataSourceVod = new MatTableDataSource(this.vodTableData.dataRows);


        });
    }

    onListPaginateChange(event) {


        console.log("page index:" + event.pageIndex);
        console.log("length:" + event.length);
        console.log("page size:" + event.pageSize);

        this.pageSize = event.pageSize;
        this.streamListOffset = event.pageIndex;

        this.getAppLiveStreams(event.pageIndex, this.pageSize);
    }

    onGridPaginateChange(event) {
        console.log("page index:" + event.pageIndex);
        console.log("length:" + event.length);
        console.log("page size:" + event.pageSize);

        this.pageSize = event.pageSize;


        this.openGridPlayers(event.pageIndex, this.pageSize);

    }

    ngAfterViewInit() {
        this.cdr.detectChanges();

    }

    getInitParams (){
        this.sub = this.route.params.subscribe(params => {
            //this method is called whenever app changes

            this.appName = params['appname']; // (+) converts string 'id' to a number

            if (typeof this.appName == "undefined") {

                this.restService.getApplications().subscribe(data => {

                    //second element is the Applications. It is not safe to make static binding.

                    for (var i in data['applications']) {
                        //console.log(data['applications'][i]);
                        this.router.navigateByUrl("/applications/" + data['applications'][i]);
                        break;
                    }
                });
                return;
            }

            this.getSettings();

            this.restService.isEnterpriseEdition().subscribe(data => {
                this.isEnterpriseEdition = data["success"];
            });


            this.getAppLiveStreamsNumber();
            this.getVoDStreams();
            this.getAppLiveStreams(0, this.pageSize);
        });

    }

    changeApplication() {
        this.clearTimer();
        this.getAppLiveStreamsNumber();
        this.getVoDStreams();
        this.getAppLiveStreams(0, this.pageSize);

    }


    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    applyFilterVod(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSourceVod.filter = filterValue;
    }

    openSettingsDialog(selected: LiveBroadcast): void {


        if (selected.endPointList != null) {
            this.editBroadcastShareFacebook = false;
            this.editBroadcastShareYoutube = false;
            this.editBroadcastSharePeriscope = false;

            selected.endPointList.forEach(element => {
                switch (element.type) {
                    case "facebook":
                        this.editBroadcastShareFacebook = true;
                        break;
                    case "youtube":
                        this.editBroadcastShareYoutube = true;
                        break;
                    case "periscope":
                        this.editBroadcastSharePeriscope = true;
                        break;
                }

            });
        }


        this.selectedBroadcast = selected;

        let dialogRef = this.dialog.open(CamSettingsDialogComponent, {
            width: '300px',
            data: {
                name: this.selectedBroadcast.name,
                url: this.selectedBroadcast.ipAddr,
                username: this.selectedBroadcast.username,
                pass: this.selectedBroadcast.password,
                id: this.selectedBroadcast.streamId,
                status: this.selectedBroadcast.status,
                streamUrl: this.selectedBroadcast.streamUrl,
                appName: this.appName,
                endpointList: selected.endPointList,
                videoServiceEndpoints: this.videoServiceEndpoints,
                editBroadcastShareFacebook: this.editBroadcastShareFacebook,
                editBroadcastShareYoutube: this.editBroadcastShareYoutube,
                editBroadcastSharePeriscope: this.editBroadcastSharePeriscope,
            }
        });


        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.getAppLiveStreams(this.streamListOffset, this.pageSize);
            this.getAppLiveStreamsNumber();

        });
    }

    showLiveComments(broadcast: LiveBroadcast): void {
        this.dialog.open(SocialMediaStatsComponent, {
            width: '90%',
            data: {
                appName: this.appName,
                streamName: broadcast.name,
                streamId: broadcast.streamId,
                endpointList: broadcast.endPointList,
            },
            disableClose: true,
        });
    }


    openStreamSourceSettingsDialog(selected: LiveBroadcast): void {


        if (selected.endPointList != null) {
            this.editBroadcastShareFacebook = false;
            this.editBroadcastShareYoutube = false;
            this.editBroadcastSharePeriscope = false;

            selected.endPointList.forEach(element => {
                switch (element.type) {
                    case "facebook":
                        this.editBroadcastShareFacebook = true;
                        break;
                    case "youtube":
                        this.editBroadcastShareYoutube = true;
                        break;
                    case "periscope":
                        this.editBroadcastSharePeriscope = true;
                        break;
                }

            });
        }

        this.selectedBroadcast = selected;

        let dialogRef = this.dialog.open(StreamSourceEditComponent, {
            width: '450px',
            data: {
                name: this.selectedBroadcast.name,
                url: this.selectedBroadcast.ipAddr,
                username: this.selectedBroadcast.username,
                pass: this.selectedBroadcast.password,
                id: this.selectedBroadcast.streamId,
                status: this.selectedBroadcast.status,
                appName: this.appName,
                streamUrl:this.selectedBroadcast.streamUrl,
                endpointList: selected.endPointList,
                videoServiceEndpoints: this.videoServiceEndpoints,
                editBroadcastShareFacebook: this.editBroadcastShareFacebook,
                editBroadcastShareYoutube: this.editBroadcastShareYoutube,
                editBroadcastSharePeriscope: this.editBroadcastSharePeriscope,
            }
        });


        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.getAppLiveStreams(this.streamListOffset, this.pageSize);
            this.getAppLiveStreamsNumber();

        });
    }

    hasSocialEndpoint(broadcast: LiveBroadcast): boolean {
        let hasEndpoint: boolean = false;

        if (broadcast.endPointList) {
            for (let item of broadcast.endPointList) {
                if (item.endpointServiceId) {
                    hasEndpoint = true;
                    break;
                }
            }
        }
        return hasEndpoint;
    }



    openVodUploadDialog(): void {

        let dialogRef = this.dialog.open(UploadVodDialogComponent, {
            data: { appName: this.appName },
            width: '300px'

        });


        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.getVoDStreams();
        });
    }


    openBroadcastEditDialog(stream: BroadcastInfo): void {


        if (stream.endPointList != null) {
            this.editBroadcastShareFacebook = false;
            this.editBroadcastShareYoutube = false;
            this.editBroadcastSharePeriscope = false;

            stream.endPointList.forEach(element => {
                switch (element.type) {
                    case "facebook":
                        this.editBroadcastShareFacebook = true;
                        break;
                    case "youtube":
                        this.editBroadcastShareYoutube = true;
                        break;
                    case "periscope":
                        this.editBroadcastSharePeriscope = true;
                        break;
                }

            });
        }


        if (this.liveStreamEditing == null || stream.streamId != this.liveStreamEditing.streamId || stream.name != this.liveStreamEditing.name) {
            this.liveStreamEditing = new LiveBroadcast();
            this.liveStreamEditing.streamId = stream.streamId;
            this.liveStreamEditing.name = stream.name;
            this.liveStreamEditing.description = "";
        }


        if (this.liveStreamEditing) {
            let dialogRef = this.dialog.open(BroadcastEditComponent, {


                data: {
                    name: this.liveStreamEditing.name,
                    streamId: this.liveStreamEditing.streamId,
                    appName: this.appName,
                    endpointList: stream.endPointList,
                    videoServiceEndpoints: this.videoServiceEndpoints,
                    editBroadcastShareFacebook: this.editBroadcastShareFacebook,
                    editBroadcastShareYoutube: this.editBroadcastShareYoutube,
                    editBroadcastSharePeriscope: this.editBroadcastSharePeriscope,
                    // ************** TODO: open it *************************
                    //socialMediaAuthStatus:this.socialMediaAuthStatus
                }

            });


            dialogRef.afterClosed().subscribe(result => {
                console.log('The dialog was closed');
                this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                this.getAppLiveStreamsNumber();


            });

        }
    }


    test() {
        alert("test");
    }


    getAppLiveStreams(offset: number, size: number): void {

        offset = offset * size;

        this.restService.getAppLiveStreams(this.appName, offset, size).subscribe(data => {
            this.broadcastTableData.dataRows = [];
            for (var i in data) {

                var endpoint = [];
                for (var j in data[i].endPointList) {
                    endpoint.push(data[i].endPointList[j]);
                }
                this.broadcastTableData.dataRows.push(data[i]);

                this.broadcastTableData.dataRows[i].iframeSource = HTTP_SERVER_ROOT + this.appName + "/play.html?name=" + this.broadcastTableData.dataRows[i].streamId + "&autoplay=true";

            }
            this.dataSource = new MatTableDataSource(this.broadcastTableData.dataRows);
        });
    }


    cleanURL(oldURL: string): SafeResourceUrl {
        console.log("clean url");
        return this.sanitizer.bypassSecurityTrustResourceUrl(oldURL);
    }


    filterAppLiveStreams(type: String): void {

        if (type == "displayAll") {
            this.getAppLiveStreams(0, 50);
        }

        else {
            this.restService.filterAppLiveStreams(this.appName, 0, 10, type).subscribe(data => {
                //console.log(data);
                this.broadcastTableData.dataRows = [];
                console.log("type of data -> " + typeof data);

                for (var i in data) {

                    this.broadcastTableData.dataRows.push(data[i]);

                }


                if (this.isGridView) {
                    setTimeout(() => {
                        this.openGridPlayers(0, 4);
                    }, 500);

                }


                setTimeout(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                }, 500);


            });
        }

    }

    getAppLiveStreamsNumber(): void {
        this.restService.getTotalBroadcastNumber(this.appName).subscribe(
            data => {

                this.listLength = data;
            });
    }


    getVoDStreams(): void {

        this.searchWarning = false;
        this.keyword = null;

        //this for getting full length of vod streams for paginations

        this.restService.getTotalVodNumber(this.appName).subscribe(data => {
            this.vodLength = data;
        });


        this.restService.getVodList(this.appName, this.vodListOffset, this.pageSize).subscribe(data => {
            this.vodTableData.dataRows = [];
            for (var i in data) {
                this.vodTableData.dataRows.push(data[i]);
            }
            this.dataSourceVod = new MatTableDataSource(this.vodTableData.dataRows);
        });
    }

    clearTimer() {
        if (this.timerId) {
            console.log("clearing interval: " + this.timerId);
            clearInterval(this.timerId);
        }

    }

    ngOnDestroy() {
        this.sub.unsubscribe();
        this.clearTimer();
    }

    getVoD(): void {
        this.getVoDStreams();
    }

    isMobileMenu() {
        if ($(window).width() > 991) {
            return true;
        }
        return false;
    }

    importLiveStreams2Stalker(): void {
        this.importingLiveStreams = true;
        this.restService.importLiveStreams2Stalker(this.appName).subscribe(data => {
            console.log(data);
            this.importingLiveStreams = false;
            var message = Locale.getLocaleInterface().streams_imported_successfully;
            var type = "success";
            var delay = 500;
            var icon = "ti-save";
            if (!data["success"]) {
                icon = "ti-alert";
                if (data["errorId"] == 404) {
                    message = Locale.getLocaleInterface().missing_configuration_parameter_for_stalker;
                }
                else {
                    message = Locale.getLocaleInterface().error_occured;
                }
                type = "warning";
                delay = 1900;
            }

            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: delay,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });

        });
    }

    importVoDStreams2Stalker(): void {
        this.importingVoDStreams = true;
        this.restService.importVoDStreams2Stalker(this.appName).subscribe(data => {
            console.log(data);
            this.importingVoDStreams = false;
            var message = Locale.getLocaleInterface().streams_imported_successfully;
            var type = "success";
            var delay = 500;
            var icon = "ti-save";
            if (!data["success"]) {
                icon = "ti-alert";
                if (data["errorId"] == 404) {
                    message = Locale.getLocaleInterface().missing_configuration_parameter_for_stalker;
                }
                else {
                    message = Locale.getLocaleInterface().error_occured;
                }
                type = "warning";
                delay = 1900;
            }

            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: delay,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });
        });
    }

    checkAndPlayLive(videoUrl: string): void {
        this.restService.getText(videoUrl).subscribe(data => {
                console.log("loaded...");
                $("#playerLoading").hide();
                flowplayer('#player', {
                    autoplay: true,
                    clip: {
                        sources: [{
                            type: 'application/x-mpegurl',
                            src: videoUrl
                        }]
                    }
                });

            },
            error => {
                console.log("error...");
                setTimeout(() => {
                    this.checkAndPlayLive(videoUrl);
                }, 5000);
            });
    }


    showDetectedObject(streamId: string): void {
        let dialogRef = this.dialog.open(DetectedObjectListDialog, {
            width: '500px',
            data: {
                streamId: streamId,
                appName: this.appName
            }
        });


    }


    playLive(streamId: string): void {

        if(this.appSettings.tokenControlEnabled){
            this.playLiveToken(streamId);
            return;
        }

        var width = "640px"
        var iframeSource = HTTP_SERVER_ROOT + this.appName + "/play.html?name=" + streamId +"&autoplay=true";
        var  htmlCode = '<iframe id="' + streamId + '" frameborder="0" allowfullscreen="true" class = "frame" seamless="seamless" style="display:block; width:100%; height:400px"  ></iframe>';
        width = "640px"

        this.openLivePlayer(htmlCode, streamId, width);


        var $iframe = $('#' + streamId);

        $iframe.prop('src', iframeSource);

    }


    playLiveToken(streamId: string): void {

        var width = "640px"

        this.restService.getToken (this.appName, streamId, 0).subscribe(data => {
            this.token = <Token>data;

            var iframeSource = HTTP_SERVER_ROOT + this.appName + "/play.html?name=" + streamId +"&autoplay=true&token=" + this.token.tokenId;
            var   htmlCode = '<iframe id="' + streamId + '"frameborder="0" allowfullscreen="true"  seamless="seamless" style="display:block; width:100%; height:400px"></iframe>';

            this.openLivePlayer(htmlCode, streamId, width);

            var $iframe = $('#' + streamId);

            $iframe.prop('src', iframeSource);
        });

    }

    openLivePlayer(htmlCode:string, streamId: string, width: string):void {

        swal({
            html: htmlCode,
            showConfirmButton: false,
            width: width,
            padding:"10px" ,
            animation: false,
            showCloseButton: true,
            onOpen: () => {

            },
            onClose: function () {


                var ifr = document.getElementById(streamId);
                ifr.parentNode.removeChild(ifr);

            }
        }).then(function () { }, function () { });



    }



    openGridPlayers(index: number, size: number): void {
        var id, name, srcFile, iframeSource;


        index = index * size;

        this.restService.getAppLiveStreams(this.appName, index, size).subscribe(data => {
            //console.log(data);
            this.broadcastGridTableData.dataRows = [];
            //console.log("type of data -> " + typeof data);

            for (var i in data) {
                var endpoint = [];
                for (var j in data[i].endPointList) {
                    endpoint.push(data[i].endPointList[j]);
                }

                this.broadcastGridTableData.dataRows.push(data[i]);

                // console.log("iframe source:  "+this.broadcastTableData.dataRows[i].iframeSource);

            }

        });

        setTimeout(() => {

            for (var i in this.broadcastGridTableData.dataRows) {

                id = this.broadcastGridTableData.dataRows[i]['streamId'];


                iframeSource = HTTP_SERVER_ROOT + this.appName + "/play.html?name=" + id + "&autoplay=true";


                var $iframe = $('#' + id);

                $iframe.prop('src', iframeSource);
            }

        }, 1500);
    }

    closeGridPlayers(): void {

        var id;

        for (var i in this.broadcastGridTableData.dataRows) {


            id = this.broadcastGridTableData.dataRows[i]['streamId'];


            var container = document.getElementById(id);

            flowplayer(container).shutdown();


            $("#" + id).html("").attr('class', +'');
        }

    }

    downloadFile(vodName: string, type: string, vodId:string, streamId:string): void {

        var srcFile = null;
        var vodUrlName = null;

        if (type == "uploadedVod") {
            srcFile = HTTP_SERVER_ROOT + this.appName + '/streams/' + vodId + '.mp4'  ;
            vodUrlName = vodId ;
        }else if (type == "streamVod"){
            srcFile = HTTP_SERVER_ROOT + this.appName + '/streams/' + vodName;
            vodUrlName = vodName ;
        }else if (type == "userVod") {
            var lastSlashIndex = this.appSettings.vodFolder.lastIndexOf("/");
            var folderName = this.appSettings.vodFolder.substring(lastSlashIndex);
            srcFile = HTTP_SERVER_ROOT + this.appName + '/streams' + folderName + '/' + vodName;
            vodUrlName = vodName ;
        }

        const link = document.createElement("a");
        link.download = vodUrlName;
        document.body.appendChild(link);
        link.href = srcFile;
        link.target = '_blank';
        link.click();
    }



    playVoD(vodName: string, type: string, vodId:string, streamId:string): void {

        if(this.appSettings.tokenControlEnabled){
            this.playVoDToken(vodName, type, vodId, streamId);
            return;

        }

        var srcFile = null;

        if (type == "uploadedVod") {
            srcFile = HTTP_SERVER_ROOT + this.appName + '/streams/' + vodId + '.mp4'  ;
        }else if (type == "streamVod"){
            srcFile = HTTP_SERVER_ROOT + this.appName + '/streams/' + vodName;
        }else if (type == "userVod") {
            var lastSlashIndex = this.appSettings.vodFolder.lastIndexOf("/");
            var folderName = this.appSettings.vodFolder.substring(lastSlashIndex);
            srcFile = HTTP_SERVER_ROOT + this.appName + '/streams' + folderName + '/' + vodName;
        }

        if (srcFile != null) {

            this.openVoDPlayer(srcFile);
        }
        else {
            console.error("Undefined type");
        }

    }

    openVoDPlayer (url:string): void {

        swal({
            html: '<div id="player"></div>',
            showConfirmButton: false,
            width: '800px',
            animation: false,
            onOpen: function () {

                flowplayer('#player', {
                    autoplay: true,
                    clip: {
                        sources: [{
                            type: 'video/mp4',
                            src: url
                        }
                        ]
                    }
                });
            },
            onClose: function () {
                flowplayer("#player").shutdown();
            }
        });
    }

    playVoDToken(name: string, type: string, vodId:string, streamId:string):void{
        let tokenParam;
        let source;

        let lastSlashIndex = name.lastIndexOf(".mp4");
        let  VoDName = name.substring(0, lastSlashIndex);

        if(type == "uploadedVod" ){
            tokenParam = vodId;
            source = vodId;
        }
        else if (type == "streamVod" ) {
            tokenParam = streamId;
            source = VoDName;
        }
        else if (type == "userVod" ) {
            tokenParam = VoDName;
            var index = this.appSettings.vodFolder.lastIndexOf("/");
            var folderName = this.appSettings.vodFolder.substring(index);
            source =  folderName + '/' + VoDName ;
        }

        if (tokenParam != null ){

            this.restService.getToken (this.appName, tokenParam, 0).subscribe(data => {
                this.token = <Token>data;
                var srcFile = null;
                srcFile = HTTP_SERVER_ROOT + this.appName + '/streams/' + source + '.mp4?token=' + this.token.tokenId  ;

                if(srcFile != null) {
                    this.openVoDPlayer(srcFile);
                }
            });
        }

    }

    deleteVoD(fileName: string, vodId: number, type: string): void {


        swal({
            title: Locale.getLocaleInterface().are_you_sure,
            text: Locale.getLocaleInterface().wont_be_able_to_revert,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(() => {

            this.restService.deleteVoDFile(this.appName, fileName, vodId, type).subscribe(data => {
                if (data["success"] == true) {

                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().vod_deleted
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
                    this.showVoDFileNotDeleted();
                }
                this.getVoDStreams();
            });

        }).catch(function () {

        });
    }

    showVoDFileNotDeleted() {
        $.notify({
            icon: "ti-save",
            message: Locale.getLocaleInterface().vodFileNotDeleted
        }, {
            type: "warning",
            delay: 900,
            placement: {
                from: 'top',
                align: 'right'
            }
        });
    }

    editLiveBroadcast(stream: BroadcastInfo): void {
        if (stream.endPointList != null) {
            this.editBroadcastShareFacebook = false;
            this.editBroadcastShareYoutube = false;
            this.editBroadcastSharePeriscope = false;

            stream.endPointList.forEach(element => {
                switch (element.type) {
                    case "facebook":
                        this.editBroadcastShareFacebook = true;
                        break;
                    case "youtube":
                        this.editBroadcastShareYoutube = true;
                        break;
                    case "periscope":
                        this.editBroadcastSharePeriscope = true;
                        break;
                }

            });
        }
        if (this.liveStreamEditing == null || stream.streamId != this.liveStreamEditing.streamId) {
            this.liveStreamEditing = new LiveBroadcast();
            this.liveStreamEditing.streamId = stream.streamId;
            this.liveStreamEditing.name = stream.name;
            this.liveStreamEditing.description = "";
        }
        else {
            this.liveStreamEditing = null;
        }
    }


    updateLiveStream(isValid: boolean): void {
        if (!isValid) {
            return;
        }

        this.liveStreamUpdating = true;
        var socialNetworks = [];

        if (this.editBroadcastShareFacebook) {
            socialNetworks.push("facebook");
        }

        if (this.editBroadcastShareYoutube == true) {
            socialNetworks.push("youtube");
        }

        if (this.editBroadcastSharePeriscope == true) {
            socialNetworks.push("periscope");
        }

        this.restService.updateLiveStream(this.appName, this.liveStreamEditing,
            socialNetworks).subscribe(data => {
            this.liveStreamUpdating = false;
            console.log(data["success"]);
            if (data["success"]) {
                this.liveStreamEditing = null;
                //update the rows
                this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                this.getAppLiveStreamsNumber();
                $.notify({
                    icon: "ti-save",
                    message: Locale.getLocaleInterface().broadcast_updated
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
                    message: Locale.getLocaleInterface().broadcast_not_updated + " " + data["message"] + " " + data["errorId"]
                }, {
                    type: "warning",
                    delay: 900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
        });

    }



    deleteLiveBroadcast(streamId: string): void {
        swal({
            title: Locale.getLocaleInterface().are_you_sure,
            text: Locale.getLocaleInterface().wont_be_able_to_revert,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(data => {
            this.restService.deleteBroadcast(this.appName, streamId)
                .subscribe(data => {
                    if (data["success"] == true) {

                        this.restService.stopBroadcast(this.appName,streamId);

                        $.notify({
                            icon: "ti-save",
                            message: "Successfully deleted"
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
                            icon: "ti-save",
                            message: Locale.getLocaleInterface().broadcast_not_deleted
                        }, {
                            type: "warning",
                            delay: 900,
                            placement: {
                                from: 'top',
                                align: 'right'
                            }
                        });
                    }
                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getAppLiveStreamsNumber();



                    if (this.isGridView) {
                        setTimeout(() => {
                            this.switchToGridView();
                        }, 500);
                    }



                });
        });

    }


    addNewStream(): void {

        if (!this.encoderSettings) {
            this.encoderSettings = [];
        }

        this.encoderSettings.push({
            height: 0,
            videoBitrate: 0,
            audioBitrate: 0
        });

    }

    dropDownChanged(event:any,i:number){

        if(event == 1080) {
            this.encoderSettings[i].videoBitrate = 2000;
            this.encoderSettings[i].audioBitrate = 256;
        }
        if(event == 720) {
            this.encoderSettings[i].videoBitrate = 1500;
            this.encoderSettings[i].audioBitrate = 128;
        }
        if(event == 480) {
            this.encoderSettings[i].videoBitrate = 1000;
            this.encoderSettings[i].audioBitrate = 96;
        }
        if(event == 360) {
            this.encoderSettings[i].videoBitrate = 800;
            this.encoderSettings[i].audioBitrate = 64;
        }
        if(event == 240) {
            this.encoderSettings[i].videoBitrate = 500;
            this.encoderSettings[i].audioBitrate = 32;
        }


    }

    deleteStream(index: number): void {
        this.encoderSettings.splice(index, 1);
    }

    setSocialNetworkChannel(endpointId: string, type: string, value: string): void {
        this.restService.setSocialNetworkChannel(this.appName, endpointId, type, value).subscribe(data => {
            console.log("set social network channel: " + data["success"]);
            if (data["success"]) {
                this.getSocialEndpoints();
            }

        });
    }

    async showChannelChooserDialog(options: any, endpointId: string, type: string): Promise<boolean> {
        const { value: id } = await swal({
            title: 'Select the target to publish',
            input: 'select',
            inputOptions: options,
            inputPlaceholder: 'Select the Page',
            showCancelButton: true,
            inputValidator: (value) => {

                return new Promise((resolve) => {
                    if (value) {
                        console.log("selected id: " + value);

                        this.setSocialNetworkChannel(endpointId, type, value);

                        resolve();
                    }
                    else {
                        console.log("not item selected");
                        resolve()
                    }

                });

            },

        });

        return null;


    }
    showNetworkChannelList(endpointId: string, type: string): void {
        this.userFBPagesLoading = true;
        this.restService.getSocialNetworkChannelList(this.appName, endpointId, type).subscribe(data => {
            console.log(data);
            var options = {
            };

            for (var i in data) {
                options[data[i]["id"]] = data[i]["name"];
            }
            this.userFBPagesLoading = false;
            this.showChannelChooserDialog(options, endpointId, type);

        });

    }


    getSocialEndpoints(): void {
        this.restService.getSocialEndpoints(this.appName).subscribe(data => {

            this.videoServiceEndpoints = [];
            for (var i in data) {
                console.log(data[i]);
                this.videoServiceEndpoints.push(data[i]);
            }

        });
    }

    getSettings(): void {
        this.restService.getSettings(this.appName).subscribe(data => {
            this.appSettings = <AppSettings>data;


            this.encoderSettings = [];
            this.appSettings.encoderSettings.forEach((value, index) => {
                if (value != null ) {
                    this.encoderSettings.push({
                        height: this.appSettings.encoderSettings[index].height,
                        videoBitrate: this.appSettings.encoderSettings[index].videoBitrate / 1000,
                        audioBitrate: this.appSettings.encoderSettings[index].audioBitrate / 1000
                    });

                }
            });

            this.acceptAllStreams = !this.appSettings.acceptOnlyStreamsInDataStore ;


        });



        this.getSocialEndpoints();

    }

    getToken(streamId:string): void {
        this.token = null;

        this.restService.getToken (this.appName, streamId, 0).subscribe(data => {
            this.token = <Token>data;
        });

    }



    changeSettings(valid: boolean): void {

        if (!valid) {
            return;
        }

        this.appSettings.encoderSettings = [];

        this.encoderSettings.forEach((value, index) => {
            if (value != null ) {
                this.appSettings.encoderSettings.push({
                    height: this.encoderSettings[index].height,
                    videoBitrate: this.encoderSettings[index].videoBitrate * 1000,
                    audioBitrate: this.encoderSettings[index].audioBitrate * 1000
                });

            }
        });

        this.appSettings.remoteAllowedCIDR = this.appSettings.remoteAllowedCIDR.trim();

        if(this.appSettings.remoteAllowedCIDR == ""){
        this.appSettings.remoteAllowedCIDR = "127.0.0.1";
        }

        this.appSettings.acceptOnlyStreamsInDataStore = !this.acceptAllStreams ;


        this.restService.changeSettings(this.appName, this.appSettings).subscribe(data => {
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

            this.appSettings.encoderSettings.forEach((value, index) => {
                if (value != null ) {
                    this.appSettings.encoderSettings[index].videoBitrate /= 1000 ;
                    this.appSettings.encoderSettings[index].audioBitrate /= 1000 ;
                }
            });

        });
    }

    newLiveStream(): void {
        this.shareEndpoint = [];
        this.newLiveStreamActive = true;
        this.newIPCameraActive = false;
        this.newStreamSourceActive = false;
        this.streamNameEmpty = false;
    }

    newIPCamera(): void {
        this.newLiveStreamActive = false;
        this.newIPCameraActive = true;
        this.newStreamSourceActive = false;
        this.streamNameEmpty = false;
    }

    newStreamSource(): void {
        this.shareEndpoint = [];
        this.newLiveStreamActive = false;
        this.newIPCameraActive = false;
        this.newStreamSourceActive = true;
        this.streamNameEmpty = false;
    }


    addIPCamera(isValid: boolean): void {
        this.streamNameEmpty = false;

        if (!isValid) {
            //not valid form return directly
            return;
        }



        if (!this.restService.checkStreamName(this.liveBroadcast.name)){
            this.streamNameEmpty = true;

            return;
        }
        this.newIPCameraAdding = true;
        this.liveBroadcast.type = "ipCamera";


        var socialNetworks = [];
        this.restService.addStreamSource(this.appName, this.liveBroadcast, socialNetworks.join(","))
            .subscribe(data => {
                //console.log("data :" + JSON.stringify(data));
                if (data["success"] == true) {

                    console.log("success: " + data["success"]);
                    console.log("error: " + data["message"]);

                    this.newIPCameraAdding = false;

                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().new_broadcast_created
                    }, {
                        type: "success",
                        delay: 1000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getAppLiveStreamsNumber();

                    this.liveBroadcast.streamUrl = "";

                }
                else {

                    console.log("success: " + data["success"]);
                    console.log("error: " + data["message"]);

                    this.newIPCameraAdding = false;

                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().new_broadcast_error
                    }, {
                        type: "warning",
                        delay: 2000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });


                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getAppLiveStreamsNumber();
                }

                //swal.close();
                this.newIPCameraAdding = false;
                this.newIPCameraActive = false;
                this.liveBroadcast.name = "";
                this.liveBroadcast.username = "";
                this.liveBroadcast.password = "";


                if (this.isGridView) {
                    setTimeout(() => {
                        this.switchToGridView();
                    }, 500);
                }
            });


        setTimeout(()=>{

            this.restService.getCameraError(this.appName , this.liveBroadcast.ipAddr) .subscribe(data => {

                console.log("stream ID :  "+this.liveBroadcast.ipAddr);

                if(data["message"] != null){

                    if (data["message"].includes("401")) {

                        swal({
                            title: "Authorization Error",
                            text: "Please Check Username and/or Password",
                            type: 'error',

                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'OK'
                        }).then(() => {


                        }).catch(function () {

                        });
                    }
                }

                else{

                    console.log("no  camera error")
                }

                this.liveBroadcast.ipAddr = "";
            });

        },8000)

    }



    addStreamSource(isValid: boolean): void {

        this.streamNameEmpty = false;

        if (!isValid) {
            //not valid form return directly
            return;
        }


        if (!this.restService.checkStreamName(this.liveBroadcast.name)) {

            this.streamNameEmpty = true;
            return;
        }

        if(!this.restService.checkStreamUrl(this.liveBroadcast.streamUrl)){
            console.log("stream source address is not in correct format");
            this.streamUrlValid=false;
            return;
        }
        this.streamNameEmpty = false;
        this.newStreamSourceAdding = true;
        this.liveBroadcast.type = "streamSource";

        var socialNetworks = [];
        this.shareEndpoint.forEach((value, index) => {
            if (value === true) {
                socialNetworks.push(this.videoServiceEndpoints[index].id);
            }
        });

        this.restService.addStreamSource(this.appName, this.liveBroadcast, socialNetworks.join(","))
            .subscribe(data => {
                //console.log("data :" + JSON.stringify(data));
                if (data["success"] == true) {

                    this.newStreamSourceAdding = false;

                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().new_broadcast_created
                    }, {
                        type: "success",
                        delay: 1000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getAppLiveStreamsNumber();

                    this.liveBroadcast.streamUrl = "";
                    this.streamUrlValid=true;


                }
                else {

                    this.newIPCameraAdding = false;

                    $.notify({
                        icon: "ti-save",
                        message: "Error: Not added"
                    }, {
                        type: "error",
                        delay: 2000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getAppLiveStreamsNumber();

                }

                //swal.close();
                this.newStreamSourceAdding = false;
                this.newStreamSourceActive = false;
                this.liveBroadcast.name = "";
                this.liveBroadcast.ipAddr = "";
                this.liveBroadcast.username = "";
                this.liveBroadcast.password = "";


                if (this.isGridView) {
                    setTimeout(() => {
                        this.switchToGridView();
                    }, 500);
                }


            });

    }

    startDiscover() {
        this.discoveryStarted = true;
        this.onvifURLs = this.getDiscoveryList();
        this.noCamWarning = false;

        setTimeout(() => {

            if (this.onvifURLs) {
                for (var i = 0; i < this.broadcastTableData.dataRows.length; i++) {
                    for (var j = 0; j < this.onvifURLs.length; j++) {

                        if (this.broadcastTableData.dataRows[i].type == "ipCamera") {

                            if (this.onvifURLs[j] == this.broadcastTableData.dataRows[i].ipAddr) {

                                console.log("found:  " + this.onvifURLs[j]);
                                // if camera is already registered then remove it from aray
                                var x = this.onvifURLs.indexOf(this.onvifURLs[j]);
                                this.onvifURLs.splice(x, 1);

                            }
                        }
                    }
                }

            }

            if (this.onvifURLs) {

                //if all cameras are added, onvif array may still be alive, then length control should be done
                if (this.onvifURLs.length > 0) {

                    console.log(this.onvifURLs[0]);


                    console.log(this.onvifURLs.length);


                    this.discoveryStarted = false;
                    swal({

                        type: 'info',
                        title: "Onvif Camera(s) ",
                        input: 'radio',
                        inputOptions: this.onvifURLs,
                        width: '355px',

                        inputValidator: function (value) {
                            return new Promise(function (resolve, reject) {
                                if (value !== '') {
                                    resolve();
                                } else {
                                    reject('Select Camera');
                                }
                            });

                        },


                    }).then((result) => {

                        if (result) {
                            this.liveBroadcast.ipAddr = this.onvifURLs[result].toString();

                        }
                    })

                } else {

                    this.discoveryStarted = false;
                    this.noCamWarning = true;
                    this.camera.ipAddr = "";

                }
            } else {

                this.discoveryStarted = false;
                this.noCamWarning = true;
                this.camera.ipAddr = "";

            }


        }, 6000);


    }

    getDiscoveryList(): String[] {

        this.onvifURLs = null;

        this.restService.autoDiscover(this.appName).subscribe(
            streams => {


                if (streams.length != 0) {
                    this.onvifURLs = streams;
                    console.log('result: ' + this.onvifURLs[0]);
                }
            },
            error => {
                console.log('!!!Error!!! ' + error);
            },
        );

        return this.onvifURLs;
    }


    toConsole(val: string): void {

        console.log(val)

    }

    createLiveStream(isValid: boolean): void {

        this.streamNameEmpty = false;

        if (!isValid) {
            //not valid form return directly
            return;
        }

        this.liveBroadcast.type = "liveStream";

        if (!this.restService.checkStreamName(this.liveBroadcast.name)){

            this.streamNameEmpty = true;
            return;
        }

        var socialNetworks = [];
        this.shareEndpoint.forEach((value, index) => {
            if (value === true) {
                socialNetworks.push(this.videoServiceEndpoints[index].id);
            }
        });


        this.newLiveStreamCreating = true;
        this.restService.createLiveStream(this.appName, this.liveBroadcast, socialNetworks.join(","))
            .subscribe(data => {
                //console.log("data :" + JSON.stringify(data));
                if (data["streamId"] != null) {

                    this.newLiveStreamActive = false;

                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().new_broadcast_created
                    }, {
                        type: "success",
                        delay: 900,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.liveBroadcast.name = "";
                }

                this.newLiveStreamCreating = false;
                this.getAppLiveStreamsNumber();


                if (this.isGridView) {
                    setTimeout(() => {
                        this.switchToGridView();
                    }, 500);
                }


            });

    }

    switchToListView(): void {
        this.isGridView = false;

        this.getAppLiveStreams(0, 5);

        var container = document.getElementById('cbp-vm'),
            optionSwitch = Array.prototype.slice.call(container.querySelectorAll('div.cbp-vm-options > a'));


        optionSwitch.forEach(function (el, i) {
            el.addEventListener('click', function () {

                change(this);



            }, );
        });


        function change(opt) {
            // remove other view classes and any selected option


            optionSwitch.forEach(function (el) {
                classie.remove(container, el.getAttribute('data-view'));
                classie.remove(el, 'cbp-vm-selected');
            });
            // add the view class for this option
            classie.add(container, opt.getAttribute('data-view'));
            // this option stays selected
            classie.add(opt, 'cbp-vm-selected');
        }

        // this.closeGridPlayers();

    }


    switchToGridView(): void {
        this.isGridView = true;

        setTimeout(() => {
            this.openGridPlayers(0, 4);
        }, 500);
    }

    getSocialMediaAuthParameters(networkName: string): void {

        this.gettingDeviceParameters = true;

        this.restService.getDeviceAuthParameters(this.appName, networkName).subscribe(data => {

            if (data['verification_url']) {
                if (!data['verification_url'].startsWith("http")) {
                    data['verification_url'] = "http://" + data['verification_url'];
                }

                var message = Locale.getLocaleInterface().copy_this_code_and_enter_the_url.replace("CODE_KEY", data['user_code']);

                message = message.replace("URL_KEY", data['verification_url']); //this is for url
                message = message.replace("URL_KEY", data['verification_url']); //this is for string
                var typem = 'info';


                this.gettingDeviceParameters = false;
                swal({
                    html: message,
                    type: typem,
                    // showConfirmButton: false,
                    showCancelButton: true,
                    // width: '800px',
                    onOpen: function () {
                        console.log("onopen");

                    },
                    onClose: function () {
                        console.log("onclose");
                    }
                }).then(() => {
                    this.waitingForConfirmation = true;
                    this.checkAuthStatus(data['user_code'], networkName);
                })

            } else if (this.isEnterpriseEdition == false
                && data['errorId'] == ERROR_SOCIAL_ENDPOINT_UNDEFINED_ENDPOINT) {

                message = Locale.getLocaleInterface().notEnterprise;

                typem = 'error';
                this.gettingDeviceParameters = false;

                swal({
                    html: message,
                    type: typem,
                    // showConfirmButton: false,
                    showCancelButton: false,
                    // width: '800px',
                    onOpen: function () {
                        console.log("onopen");

                    },
                    onClose: function () {
                        console.log("onclose");
                    }
                });

            } else if (this.isEnterpriseEdition == true && data['errorId'] == ERROR_SOCIAL_ENDPOINT_UNDEFINED_CLIENT_ID) {

                message = Locale.getLocaleInterface().ketNotdefined;
                typem = 'error';
                this.gettingDeviceParameters = false;
                swal({
                    html: message,
                    type: typem,
                    // showConfirmButton: false,
                    showCancelButton: false,
                    // width: '800px',
                    onOpen: function () {
                        console.log("onopen");

                    },
                    onClose: function () {
                        console.log("onclose");
                    }
                });
            }
        });
    }

    cancelNewLiveStream(): void {
        this.newLiveStreamActive = false;
    }

    cancelNewIPCamera(): void {
        this.newIPCameraActive = false;
    }

    cancelStreamSource(): void {
        this.newStreamSourceActive = false;
    }

    copyPublishUrl(streamUrl: string): void {
        this.clipBoardService.copyFromContent(this.getRtmpUrl(streamUrl));
        $.notify({
            message: Locale.getLocaleInterface().publish_url_copied_to_clipboard
        }, {
            type: "success",
            delay: 400,
            timer: 500,
            placement: {
                from: 'top',
                align: 'right'
            }
        });

    }

    copyLiveEmbedCode(streamUrl: string): void {

        //if (this.isEnterpriseEdition) {
        //  streamUrl += "_adaptive";
        //}

        let embedCode = '<iframe width="560" height="315" src="'
            + HTTP_SERVER_ROOT + this.appName + "/play.html?name=" + streamUrl
            + '" frameborder="0" allowfullscreen></iframe>';

        this.clipBoardService.copyFromContent(embedCode);
        $.notify({
            message: Locale.getLocaleInterface().embed_code_copied_to_clipboard
        }, {
            type: "success",
            delay: 400,
            timer: 500,
            placement: {
                from: 'top',
                align: 'right'
            }
        });
    }

    copyVoDEmbedCode(name: string, type: string, vodId: string): void {

        var Index = this.appSettings.vodFolder.lastIndexOf("/");
        var folderName = this.appSettings.vodFolder.substring(Index);

        var lastSlashIndex = name.lastIndexOf(".mp4");
        var  VoDName = name.substring(0, lastSlashIndex);

        if(type == "uploadedVod"){
            VoDName = vodId ;
        }
        else if(type == "userVod"){
            VoDName = folderName + "/" + VoDName ;
        }


        let embedCode = '<iframe width="560" height="315" src="'
            + HTTP_SERVER_ROOT + this.appName + "/play.html?name=" + VoDName
            + '" frameborder="0" allowfullscreen></iframe>';

        this.clipBoardService.copyFromContent(embedCode);
        $.notify({
            message: Locale.getLocaleInterface().embed_code_copied_to_clipboard
        }, {
            type: "success",
            delay: 400,
            timer: 500,
            placement: {
                from: 'top',
                align: 'right'
            }
        });
    }

    getRtmpUrl(streamUrl: string): string {
        return this.restService.getRtmpUrl(this.appName, streamUrl);
    }

    revokeSocialMediaAuth(endpointId: string): void {
        this.restService.revokeSocialNetwork(this.appName, endpointId)
            .subscribe(data => {
                if (data["success"] == true) {

                    this.videoServiceEndpoints = this.videoServiceEndpoints.filter(
                        element => {
                            return element.id != endpointId
                        }
                    );
                }
            });
    }

    checkAuthStatus(userCode: string, networkName: string): void {

        this.restService.checkAuthStatus(userCode, this.appName).subscribe(data => {

            if (data["success"] != true) {
                if (data["message"] == null) {
                    this.checkAuthStatusTimerId = setTimeout(() => {
                        this.checkAuthStatus(userCode, networkName);
                    }, 5000);
                }
                else {
                    this.waitingForConfirmation = false;
                    let message = Locale.getLocaleInterface().error_occured;
                    if (data["message"] == LIVE_STREAMING_NOT_ENABLED) {
                        message = Locale.getLocaleInterface().live_streaming_not_enabled_message;
                    }
                    else if (data["message"] == AUTHENTICATION_TIMEOUT) {
                        message = Locale.getLocaleInterface().authentication_timeout_message;
                    }
                    swal({
                        type: "warning",
                        //title: Locale.getLocaleInterface().congrats,
                        text: message,
                    });
                }

            }
            else {
                if (this.checkAuthStatusTimerId) {
                    clearInterval(this.checkAuthStatusTimerId);
                }

                this.getSocialEndpoints();

                this.waitingForConfirmation = false;
                if (networkName == "facebook") {
                    this.showNetworkChannelList(data["dataId"], "all");
                }
                else {
                    swal({
                        type: "success",
                        title: Locale.getLocaleInterface().congrats,
                        text: Locale.getLocaleInterface().authentication_is_done,
                    });
                }
            }
        });
    }


    filterVod() {

        this.searchWarning = false;


        if ($("#start").val()) {
            this.requestedStartDate = this.convertStartUnixTime($("#start").val());

        } else {
            this.requestedStartDate = 0;

        }
        if ($("#end").val()) {
            this.requestedEndDate = this.convertEndUnixTime($("#end").val());

        } else {
            this.requestedEndDate = 9999999999999;

        }

        this.searchParam.keyword = this.keyword;
        this.searchParam.endDate = this.requestedEndDate;
        this.searchParam.startDate = this.requestedStartDate;


        if (this.searchParam.endDate > this.searchParam.startDate) {

            console.log("");

            this.restService.filterVod(this.appName, 0, 10, this.searchParam).subscribe(data => {
                this.vodTableData.dataRows = [];
                for (var i in data) {
                    this.vodTableData.dataRows.push(data[i]);
                }

                console.log("filtered vod:  " + this.vodTableData.dataRows.length.toString());

                this.dataSourceVod = new MatTableDataSource(this.vodTableData.dataRows);

            });

        } else if (this.searchParam.endDate < this.searchParam.startDate) {

            this.searchWarning = true;
        }
        console.log("search param start:  " + this.searchParam.startDate);
        console.log("search param end:  " + this.searchParam.endDate);
        console.log("search param keyword:  " + this.searchParam.keyword);

        console.log("req start: " + this.requestedStartDate);
        console.log("req end: " + this.requestedEndDate);
        console.log("req keyword: " + this.keyword);

        if (!$("#keyword").val() || $("#keyword").val() == " ") {

            this.keyword = null;
        }
    }


    convertStartUnixTime(date: string) {

        var d = date + 'T00:00:00.000Z';

        var convertedTime = new Date(d).valueOf();
        console.log(new Date(d).valueOf());

        return convertedTime;

    }

    convertEndUnixTime(date: string) {

        var d = date + 'T23:59:59.000Z';

        var convertedTime = new Date(d).valueOf();
        console.log(new Date(d).valueOf());

        return convertedTime;

    }


    convertJavaTime(unixtimestamp: number) {


        // Months array
        var months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Convert timestamp to milliseconds
        var date = new Date(unixtimestamp);

        // Year
        var year = date.getFullYear();

        // Month
        var month = months_arr[date.getMonth()];

        // Day
        var day = date.getDate();

        // Hours
        var hours = date.getHours();

        // Minutes
        var minutes = "0" + date.getMinutes();

        // Seconds
        var seconds = "0" + date.getSeconds();

        // Display date time in MM-dd-yyyy h:m:s format
        var convdataTime = month + '-' + day + '-' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

        return convdataTime;

    }

    moveDown(camera: LiveBroadcast) {
        this.restService.moveDown(camera, this.appName).subscribe(
            result => {
                console.log('result!!!: ' + result);
            },
            error => {
                console.log('!!!Error!!! ' + error);
            },
        );
    }

    moveUp(camera: LiveBroadcast) {
        this.restService.moveUp(camera, this.appName).subscribe(
            result => {
                console.log('result!!!: ' + result);
            },
            error => {
                console.log('!!!Error!!! ' + error);
            },
        );
    }

    moveRight(camera: LiveBroadcast) {
        this.restService.moveRight(camera, this.appName).subscribe(
            result => {
                console.log('result!!!: ' + result);
            },
            error => {
                console.log('!!!Error!!! ' + error);
            },
        );
    }


    moveLeft(camera: LiveBroadcast) {
        this.restService.moveLeft(camera, this.appName).subscribe(
            result => {
                console.log('result!!!: ' + result);
            },
            error => {
                console.log('!!!Error!!! ' + error);
            },
        );
    }

    webrtcStats(broadcast : LiveBroadcast) {
        this.dialog.open(WebRTCClientStatsComponent, {
            width: '90%',
            data: {
                appName: this.appName,
                streamName: broadcast.name,
                streamId: broadcast.streamId,
            },
            disableClose: true,
        });
    }
}
