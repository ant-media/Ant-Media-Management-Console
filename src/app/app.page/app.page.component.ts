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
    Renderer2,
    ViewChild
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ActivatedRoute, Router } from '@angular/router';
import { HTTP_SERVER_ROOT, LiveBroadcast, RestService , show403Error, REST_SERVICE_ROOT} from '../rest/rest.service';
import { APP_NAME_USER_TYPE, AuthService } from '../rest/auth.service';
import { ClipboardService } from 'ngx-clipboard';
import { Locale } from "../locale/locale";
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl, PageEvent } from "@angular/material/paginator"
import { MatTableDataSource } from "@angular/material/table"
import { MatSort } from "@angular/material/sort"
import "rxjs/add/operator/toPromise";
import { AppSettings, ServerSettings } from "./app.definitions";
import { SelectionModel } from "@angular/cdk/collections";

import {
    BroadcastInfo,
    BroadcastInfoTable,
    CameraInfoTable,
    EncoderSettings,
    VideoServiceEndpoint,
    VodInfo,
    VodInfoTable,
    PlaylistItem
} from './app.definitions';
import { DetectedObjectListDialog } from './dialog/detected.objects.list';
import { UploadVodDialogComponent } from './dialog/upload-vod-dialog';
import { BroadcastEditComponent } from './dialog/broadcast.edit.dialog.component';
import { SocialMediaStatsComponent } from './dialog/social.media.stats.component';
import { WebRTCClientStatsComponent } from './dialog/webrtcstats/webrtc.client.stats.component';
import { RtmpEndpointEditDialogComponent } from './dialog/rtmp.endpoint.edit.dialog.component';
import { PlaylistEditComponent } from './dialog/playlist.edit.dialog.component';
import { Observable } from "rxjs";
import "rxjs/add/observable/of";
import { ClusterRestService } from "../rest/cluster.service";
import {
    ClusterInfoTable,
    ClusterNode,
    ClusterNodeInfo
} from '../cluster/cluster.definitions';
import { LOCAL_STORAGE_SCOPE_KEY } from 'app/rest/auth.service';
import { WebPlayer } from '@antmedia/web_player';
import { isIP } from 'net';


declare var $: any;
declare var Chartist: any;
declare var swal: any;
declare var classie: any;


const ERROR_SOCIAL_ENDPOINT_UNDEFINED_CLIENT_ID = -1;
const ERROR_SOCIAL_ENDPOINT_UNDEFINED_ENDPOINT = -2;

export const INFINITE_JWT_EXPIRE_DATE = 9516239022

declare function require(name: string);


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

export class User {
    public newPassword: string;
    public fullName: string;
    constructor(
        public email: string,
        public password: string) {
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
    public type: string;
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
    public camereErrorTimerId: any;
    public checkAuthStatusTimerId: any;
    public newLiveStreamActive: boolean;
    public newIPCameraActive: boolean;
    public newStreamSourceActive: boolean;
    public newPlaylistActive: boolean;
    public liveBroadcast: LiveBroadcast;
    public newLiveStreamCreating = false;
    public newIPCameraAdding = false;
    public newStreamSourceAdding = false;
    public newStreamSourceWarn = false;
    public newPlaylistAdding = false;
    public newPlaylistWarn = false;
    public discoveryStarted = false;
    public newSourceAdding = false;
    public isEnterpriseEdition = true;
    public isClusterMode = false;
    public filterValue = null;
    public filterValueVod = null;

    public gettingDeviceParameters = false;
    public waitingForConfirmation = false;

    public camera: Camera;
    public onvifURLs: String[];
    public newOnvifURLs: String[];
    public broadcastList: CameraInfoTable;
    public noCamWarning = false;
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
    public liveStreamUpdating = false;
    public shareEndpoint: boolean[];
    public videoServiceEndpoints: VideoServiceEndpoint[];
    public streamUrlValid = true;
    public jwtTokenValid = true;
    public streamNameEmpty = false;
    public playlistNameEmpty = false;
    public encoderSettings: EncoderSettings[];
    public acceptAllStreams: boolean;
    public dropdownTimer: any;
    public enterpriseEditionText: any;
    public autoStart: false;
    public clusterNodes: ClusterNode[];
    public user: User;
    public currentClusterNode: string;


    public appSettings: AppSettings; // = new AppSettings(false, true, true, 5, 2, "event", "no clientid", "no fb secret", "no youtube cid", "no youtube secre", "no pers cid", "no pers sec");
    public settingsJson: string;
    public settingsObject: any;
    public token: Token;
    public serverSettings: ServerSettings;
    public listTypes = [
        new HLSListType('None', ''),
        new HLSListType('Event', 'event'),
    ];

    public displayedColumnsStreams = ['select', 'name', 'status', 'viewerCount', 'extradata', 'actions'];
    public displayedColumnsVod = ['select', 'name', 'type', 'date', 'actions'];
    public displayedColumnsUserVod = ['name', 'date', 'actions'];

    public dataSource: MatTableDataSource<BroadcastInfo>;

    public dataSourceVod: MatTableDataSource<VodInfo>;
    public selectionVods = new SelectionModel<string>(true, []);
    public selectionStreams = new SelectionModel<string>(true, []);

    public selectionPlaylistVoDs = new SelectionModel<string>(true, []);

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

    private vodSortBy = "";
    private vodOrderBy = "";

    private broadcastSortBy = "";
    private broadcastOrderBy = "";

    public isJsonUpdate = false;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatPaginator, { static: false }) paginatorVod: MatPaginator;

    public clusterNodeTableData: ClusterInfoTable;

    public nodeColumns = ['nodeIp', 'cpu', 'memory', 'lastUpdateTime', 'inTheCluster', 'actions'];

    public dataSourceNode: MatTableDataSource<ClusterNodeInfo>;

    @Input() pageEvent: PageEvent;

    @Output()
    pageChange: EventEmitter<PageEvent>;

    @ViewChild(MatSort) sort: MatSort;

    timeFormatValidity: { [index: number]: boolean } = {};


    public directUrlAdding = false;
    public vodAdding = false;
    public playListItemAdding = new PlaylistItem();

    public playlistItemAddingActive = false;

    public filterValuePlaylistVoD: string;

    public vodTableDataForPlaylist: VodInfoTable;

    public dataSourcePlaylistVod: MatTableDataSource<VodInfo>;

    scheduleToStart = false;




    constructor(private route: ActivatedRoute,
        private restService: RestService,
        private clusterRestService: ClusterRestService,
        private clipBoardService: ClipboardService,
        private renderer: Renderer2,
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
        this.dataSourceNode = new MatTableDataSource<ClusterNodeInfo>();
        this.dataSourcePlaylistVod = new MatTableDataSource<VodInfo>();
        this.videoServiceEndpoints = [];
        this.filterValuePlaylistVoD = "";
    }

    setPageSizeOptions(setPageSizeOptionsInput: string) {
        this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }

    ngOnInit() {

        this.timerId = null;
        this.dropdownTimer = null;

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

        this.clusterNodeTableData = {
            dataRows: [],
        };

        this.vodTableDataForPlaylist = {
            dataRows: []
        };



        this.liveBroadcast = new LiveBroadcast();
        this.selectedBroadcast = new LiveBroadcast();
        this.liveBroadcast.name = "";
        this.liveBroadcast.type = "";
        this.searchParam = new SearchParam();
        this.appSettings = null;
        this.token = null;
        this.newLiveStreamActive = false;
        this.camera = new Camera("", "", "", "", "", "");

        this.getInitParams();

    }

    contextDropdownClicked() {

        this.clearTimer();

        this.dropdownTimer = window.setInterval(() => {
            if (this.authService.isAuthenticated) {
                if (typeof this.appName != "undefined") {
                    this.callTimer();
                }
            }
        }, 8000);
    }

    getAllStreamData() {
        if (this.authService.isAuthenticated) {
            if (typeof this.appName != "undefined") {
                this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                this.getVoDStreams();
                this.getAppLiveStreamsNumber();
            }
        }
    }


    callTimer() {
        this.clearTimer();

        //this timer gets the related information according to active application
        //so that it checks appname whether it is undefined
        this.timerId = window.setInterval(() => {
            this.getAllStreamData()

        }, 5000);
    }

    onPaginateChange(event) {


        console.log("page index:" + event.pageIndex);
        console.log("length:" + event.length);
        console.log("page size:" + event.pageSize);

        this.vodListOffset = event.pageIndex * event.pageSize;

        this.pageSize = event.pageSize;

        this.keyword = null;

        this.restService.getVodList(this.appName, this.vodListOffset, this.pageSize, this.vodSortBy, this.vodOrderBy, this.filterValueVod).subscribe(data => {
            this.vodTableData.dataRows = [];
            for (var i in data) {
                this.vodTableData.dataRows.push(data[i]);
            }

            this.dataSourceVod = new MatTableDataSource(this.vodTableData.dataRows);


        }, error => { show403Error(error); });
    }

    onListPaginateChange(event) {


        console.log("list page index:" + event.pageIndex + " length:" + event.length + " page size:" + event.pageSize);

        this.pageSize = event.pageSize;
        this.streamListOffset = event.pageIndex;

        this.getAppLiveStreams(this.streamListOffset, this.pageSize);
    }

    onGridPaginateChange(event) {
        console.log("grid page index:" + event.pageIndex + " length:" + event.length + " page size:" + event.pageSize);

        this.pageSize = event.pageSize;

        this.openGridPlayers(event.pageIndex, this.pageSize);

    }

    ngAfterViewInit() {
        this.cdr.detectChanges();



    }

    getInitParams() {

        this.sub = this.route.params.subscribe(params => {
            //this method is called whenever app changes

            this.appName = params['appname']; // (+) converts string 'id' to a number
            var appNameUserTypeJsonStr = localStorage.getItem(APP_NAME_USER_TYPE)
            if(appNameUserTypeJsonStr == null || appNameUserTypeJsonStr == ""){ // shouldnt come
                this.router.navigateByUrl("/");
                return;
            }
            var appNameUserTypeJson = JSON.parse(appNameUserTypeJsonStr)
            //let scope = localStorage.getItem(LOCAL_STORAGE_SCOPE_KEY);
            if (typeof this.appName == "undefined") {

                if ("system" in appNameUserTypeJson) {
                    this.restService.getApplications().subscribe(data => {

                        //second element is the Applications. It is not safe to make static binding.

                        for (var i in data['applications']) {
                            this.router.navigateByUrl("/applications/" + data['applications'][i]);
                            break;
                        }
                    }, error => { show403Error(error); });
                }
                else {
                  
                    this.router.navigateByUrl("/applications/" + Object.keys(appNameUserTypeJson)[0]);
                    
                }
                return;
            }

            this.broadcastOrderBy = "";
            this.broadcastSortBy = "";
            this.vodOrderBy = "";
            this.vodSortBy = "";

            this.getSettings();
            this.restService.isEnterpriseEdition().subscribe(data => {
                this.isEnterpriseEdition = data["success"];
            }, error => { show403Error(error); });

            if ("system" in appNameUserTypeJson) {
                this.restService.isInClusterMode().subscribe(data => {
                    this.isClusterMode = data["success"];
                    if (this.isClusterMode) {
                        var clusterNodeCount = 0;
                        this.clusterRestService.getClusterNodeCount().subscribe(data => {
                            clusterNodeCount = data["number"];
                            this.clusterRestService.getClusterNodes(0, clusterNodeCount).subscribe(data => {
                                this.clusterNodeTableData.dataRows = [];
                                for (let i in data) {
                                    if (data[i].status == "alive") {
                                        this.currentClusterNode = data[0].ip;
                                        this.clusterNodeTableData.dataRows.push(data[i]);
                                    }
                                }
                            }, error => { show403Error(error); });
                        }, error => { show403Error(error); });
                    }
                }, error => { show403Error(error); });
            }


        });

    }

    changeApplication() {
        this.clearTimer();
        this.getAppLiveStreamsNumber();
        this.getVoDStreams();
        this.getAppLiveStreams(0, this.pageSize);
    }

    applyFilter(filterValue: string) {
        if (this.filterValue != filterValue) {
            this.filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
            this.getAppLiveStreamsNumber();
            this.paginator.firstPage();
            this.getAppLiveStreams(0, this.pageSize);
        }
    }

    applyFilterVod(filterValue: string) {
        this.filterValueVod = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.vodListOffset = 0;
        this.getVoDStreams();
        this.paginator.firstPage();
    }

    openSettingsDialog(selected: LiveBroadcast): void {

        this.selectedBroadcast = selected;

        let dialogRef = this.dialog.open(BroadcastEditComponent, {
            width: '450px',
            data: {
                name: this.selectedBroadcast.name,
                url: this.selectedBroadcast.ipAddr,
                username: this.selectedBroadcast.username,
                pass: this.selectedBroadcast.password,
                streamId: this.selectedBroadcast.streamId,
                status: this.selectedBroadcast.status,
                type: this.selectedBroadcast.type,
                streamUrl: this.selectedBroadcast.streamUrl,
                appName: this.appName,
                webRTCViewerLimit: this.selectedBroadcast.webRTCViewerLimit,
                hlsViewerLimit: this.selectedBroadcast.hlsViewerLimit,
                dashViewerLimit: this.selectedBroadcast.dashViewerLimit,
                endpointList: selected.endPointList,
                videoServiceEndpoints: this.videoServiceEndpoints,
                autoStartStopEnabled: this.selectedBroadcast.autoStartStopEnabled,
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

        this.selectedBroadcast = selected;

        let dialogRef = this.dialog.open(BroadcastEditComponent, {
            width: '450px',
            data: {
                name: this.selectedBroadcast.name,
                url: this.selectedBroadcast.ipAddr,
                streamId: this.selectedBroadcast.streamId,
                status: this.selectedBroadcast.status,
                type: this.selectedBroadcast.type,
                appName: this.appName,
                webRTCViewerLimit: this.selectedBroadcast.webRTCViewerLimit,
                hlsViewerLimit: this.selectedBroadcast.hlsViewerLimit,
                dashViewerLimit: this.selectedBroadcast.dashViewerLimit,
                streamUrl: this.selectedBroadcast.streamUrl,
                endpointList: selected.endPointList,
                videoServiceEndpoints: this.videoServiceEndpoints,
                autoStartStopEnabled: this.selectedBroadcast.autoStartStopEnabled,
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
            width: '640px'

        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.getVoDStreams();
        });
    }


    openBroadcastEditDialog(stream: BroadcastInfo): void {

        this.liveStreamEditing = new LiveBroadcast();
        this.liveStreamEditing.streamId = stream.streamId;
        this.liveStreamEditing.name = stream.name;
        this.liveStreamEditing.webRTCViewerLimit = stream.webRTCViewerLimit;
        this.liveStreamEditing.hlsViewerLimit = stream.hlsViewerLimit;
        this.liveStreamEditing.dashViewerLimit = stream.dashViewerLimit;
        this.liveStreamEditing.description = "";

        if (this.liveStreamEditing) {
            let dialogRef = this.dialog.open(BroadcastEditComponent, {
                data: {
                    name: this.liveStreamEditing.name,
                    streamId: this.liveStreamEditing.streamId,
                    type: this.liveStreamEditing.type,
                    appName: this.appName,
                    webRTCViewerLimit: this.liveStreamEditing.webRTCViewerLimit,
                    hlsViewerLimit: this.liveStreamEditing.hlsViewerLimit,
                    dashViewerLimit: this.liveStreamEditing.dashViewerLimit,
                    endpointList: stream.endPointList,
                    videoServiceEndpoints: this.videoServiceEndpoints,
                    autoStartStopEnabled: this.selectedBroadcast.autoStartStopEnabled,
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

    openPlaylistEditDialog(stream: BroadcastInfo): void {

        let dialogRef = this.dialog.open(PlaylistEditComponent, {
            width: '720px',
            data: {
                streamId: stream.streamId,
                appName: this.appName,
                appSettings: this.appSettings
            }
        });


        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.getAppLiveStreams(this.streamListOffset, this.pageSize);
            this.getAppLiveStreamsNumber();
        });
    }

    getAppLiveStreams(offset: number, size: number): void {

        offset = offset * size;

        this.restService.getAppLiveStreams(this.appName, offset, size, this.broadcastSortBy, this.broadcastOrderBy, this.filterValue).subscribe(data => {
            console.log(data)
            this.broadcastTableData.dataRows = [];

            for (var i in data) {

                var endpoint = [];
                for (var j in data[i].endPointList) {
                    endpoint.push(data[i].endPointList[j]);
                }
                this.broadcastTableData.dataRows.push(data[i]);

                this.broadcastTableData.dataRows[i].iframeSource = HTTP_SERVER_ROOT + this.appName + "/play.html?id=" + this.broadcastTableData.dataRows[i].streamId + "&autoplay=true";

            }

            this.dataSource = new MatTableDataSource(this.broadcastTableData.dataRows);
            //console.log(this.dataSource)
            this.cdr.detectChanges();

        }, error => { show403Error(error); });

    }


    cleanURL(oldURL: string): SafeResourceUrl {
        console.log("clean url");
        return this.sanitizer.bypassSecurityTrustResourceUrl(oldURL);
    }

    getAppLiveStreamsNumber(): void {
        this.restService.getTotalBroadcastNumber(this.appName, this.filterValue).subscribe(
            data => {

                this.listLength = data["number"];
            }, error => { show403Error(error); });

        this.cdr.detectChanges();
    }

    sortVodList(e) {

        //This sort function need for the e.direction null value
        this.vodOrderBy = this.sortOrderBy(e.direction, this.vodOrderBy);

        // save cookie with table sort data here
        this.vodSortBy = e.active;

        this.getVoDStreams();
        console.log("vodSortBy->" + this.vodSortBy);
        console.log("vodOrderBy->" + this.vodOrderBy);
    }

    getBroadcastByStreamId(streamId): BroadcastInfo {
        for (var i = 0; i < this.dataSource.data.length; i++) {
            var broadcast = this.dataSource.data[i]
            if (broadcast.streamId == streamId) {
                return broadcast
            }
        }
        return null
    }

    sortBroadcastList(e) {
        //This sort function need for the e.direction null value
        this.broadcastOrderBy = this.sortOrderBy(e.direction, this.broadcastOrderBy);

        // save cookie with table sort data here
        this.broadcastSortBy = e.active;

        this.getAppLiveStreams(this.streamListOffset, this.pageSize);
        console.log("broadcastSortBy->" + this.broadcastSortBy);
        console.log("broadcastOrderBy->" + this.broadcastOrderBy);
    }

    sortOrderBy(sortDirection: string, orderBy: string): string {
        if ((sortDirection == "" || orderBy == sortDirection) && orderBy == "asc") {
            orderBy = "desc";
        }
        else if ((sortDirection == "" || orderBy == sortDirection) && orderBy == "desc") {
            orderBy = "asc";
        }
        else {
            orderBy = sortDirection;
        }
        return orderBy;
    }

    getVoDStreams(): void {

        this.searchWarning = false;
        this.keyword = null;

        //this for getting full length of vod streams for paginations

        this.restService.getTotalVodNumber(this.appName, this.filterValueVod).subscribe(data => {
            this.vodLength = data["number"];
        }, error => { show403Error(error); });


        this.restService.getVodList(this.appName, this.vodListOffset, this.pageSize, this.vodSortBy, this.vodOrderBy, this.filterValueVod).subscribe(data => {
            this.vodTableData.dataRows = [];
            for (var i in data) {
                this.vodTableData.dataRows.push(data[i]);
            }
            this.dataSourceVod = new MatTableDataSource(this.vodTableData.dataRows);
        }, error => { show403Error(error); });
    }

    clearTimer() {

        clearInterval(this.timerId);
        clearInterval(this.dropdownTimer);

        this.timerId = null;
        this.dropdownTimer = null;

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

    showDetectedObject(streamId: string): void {
        let dialogRef = this.dialog.open(DetectedObjectListDialog, {
            width: '500px',
            data: {
                streamId: streamId,
                appName: this.appName
            }
        });


    }

    getIFrameSrc(streamId: string, autoplay: string, token: string, vodName: string, playOrder: string): string {
        const broadcast = this.getBroadcastByStreamId(streamId);
        const typePlayList = broadcast != null && broadcast.type === "playlist";
        const vodNameParam = vodName != null ? `/${vodName}` : "";
        const tokenParam = token != null ? `&token=${token}` : "";
        const playOrderParam = playOrder != null ? `&playOrder=${playOrder}` : (typePlayList ? "&playOrder=hls" : "");
        return `${HTTP_SERVER_ROOT}${this.appName}/play.html?name=${streamId}&autoplay=${autoplay}${tokenParam}${playOrderParam}`;
    }

    getIFrameEmbedCode(streamId: string): string {
        return '<iframe id="' + streamId + '" frameborder="0" allowfullscreen="true" class = "frame" seamless="seamless" style="display:block; width:100%; height:480px"  ></iframe>';
    }

    playLive(streamId: string, type: string, subtracks: string[]): void {

        let hasSubTracks = subtracks != null && subtracks.length > 0;
        if (this.appSettings.playTokenControlEnabled) {
            this.openPlayerWithOneTimeToken(streamId, streamId, "640px", streamId, type, hasSubTracks);
        }
        else if (this.appSettings.playJwtControlEnabled) {
            this.openPlayerWithJWTToken(streamId, streamId, "640px", streamId, type, hasSubTracks);
        }
        else if (this.appSettings.enableTimeTokenForPlay) {
            swal({
                title: "TOTP Playback ",
                text: "TOTP Playback is not currently supported through web panel",
                type: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            }).then(() => {
            }).catch(function () {
            });
        }
        else {
            this.openPlayer(this.getIFrameEmbedCode(streamId), streamId, streamId, "640px", null, null, null, type, hasSubTracks);
        }
    }

    /**
     * It supports playing streams if streamId has the relative path such as streams/stream1.mp4
     * @param htmlCode 
     * @param objectId 
     * @param streamId 
     * @param width 
     * @param tokenId 
     * @param vodName 
     * @param playOrder 
     */
    openPlayer(htmlCode: string, objectId: string, streamId: string, width: string, tokenId: string, vodName: string, playOrder: string[], type: string, hasSubTracks: boolean): void {

        if (!hasSubTracks) {
            htmlCode = '<div id="video_container" style="height:360px;overflow:hidden">'
            + '</div>'
            + '<div id="place_holder" style="height:360px;overflow:hidden;display:flex;align-items: center;justify-content: center;">The streaming will begin shortly...</div>'

            const broadcast = this.getBroadcastByStreamId(streamId);
            const typePlayList = broadcast != null && broadcast.type === "playlist";

            var playOrderLocal = ["webrtc", "hls", "dash"];

            if (!this.isEnterpriseEdition) {
                //if it's not enterprise edition, only hls is supported
                playOrderLocal = ["hls"];
            }

            if (typePlayList) {
                playOrderLocal = ["hls"];
            }
            else if (playOrder) {
                playOrderLocal = playOrder;
            }
        }


       


        var embeddedPlayer;
        swal({
            html: htmlCode,
            showConfirmButton: false,
            width: width,
            padding: "0px",
            animation: false,
            showCloseButton: true,
            onOpen: () => {

                // Prepend subfolder to streamId if configured (and not VOD - dose not contain dot)
                var streamIdForPlayer = streamId;
                if (this.appSettings && this.appSettings.subFolder && this.appSettings.subFolder.trim() !== '' && !streamId.includes(".")) {
                    streamIdForPlayer = this.appSettings.subFolder + '/' + streamId;
                }

                //the error in this callback does not show up in browser console.
                if (hasSubTracks) {
                    //play with multirack player
                    var iframe = $('#' + objectId);

                    iframe.prop('src', HTTP_SERVER_ROOT  + 'multitrack-play.html?id=' + streamIdForPlayer + '&app='+this.appName+'&token='+tokenId);
                     //multitrack-play.html is deployed in the solution in the enterprise edition CI pipeline
                     //Even if it's not a good solution, it helps us play the multitrack streams.  

                }
                else {
                    //play with web player
                    var httpBaseUrlForStream = HTTP_SERVER_ROOT + this.appName;

                    if (httpBaseUrlForStream.startsWith("//")) {
                        httpBaseUrlForStream = location.protocol + httpBaseUrlForStream;
                    }

                    embeddedPlayer = new WebPlayer({
                        streamId: streamIdForPlayer,
                        httpBaseURL: httpBaseUrlForStream,
                        token: tokenId,
                        playOrder: playOrderLocal,
                        restAPIPromise: (endpoint, requestOptions) => {

                            if (requestOptions.method === "GET") {
                                var promise = new Promise((resolve, reject) => {
                                    endpoint = endpoint.replace("?", "&");
                                    this.restService.callGet(this.appName, endpoint).subscribe(data => {
                                        resolve(data);

                                    }, error => {
                                        reject(error);
                                    });
                                });
                                return promise;
                            }
                            else if (requestOptions.method === "POST") {
                                endpoint = endpoint.replace("?", "&");

                                var promise = new Promise((resolve, reject) => {
                                    return this.restService.callPost(this.appName, endpoint, requestOptions.body).subscribe(data => {
                                        resolve(data);
                                    }, error => {
                                        reject(error);
                                    });

                                });
                                return promise;
                            }
                        },
                        isIPCamera: type == "ipCamera",
                        videoHTMLContent: '<video id="video-player" class="video-js vjs-default-skin vjs-big-play-centered" controls playsinline style="width:100%;height:100%"></video>',
                    },
                        document.getElementById("video_container"),
                        document.getElementById("place_holder"));

                    embeddedPlayer.initialize().then(() => {
                        embeddedPlayer.play();
                    }).catch((error) => {
                        console.error("Error while initializing embedded player: " + error);
                    });

                }
            },
            onClose: function () {
                if (hasSubTracks) {
                    var ifr = document.getElementById(objectId);
                    ifr.parentNode.removeChild(ifr);
                }
                if (embeddedPlayer) {
                    embeddedPlayer.destroy();
                }
            }
        })
            .then(function () { }, function () { })
            .catch(function () {
            });
    }

    openGridPlayers(index: number, size: number): void {
        var id;


        index = index * size;

        this.restService.getAppLiveStreams(this.appName, index, size, this.broadcastSortBy, this.broadcastOrderBy, null).subscribe(data => {
            //console.log(data);
            this.broadcastGridTableData.dataRows = [];

            for (var i in data) {
                var endpoint = [];
                for (var j in data[i].endPointList) {
                    endpoint.push(data[i].endPointList[j]);
                }
                this.broadcastGridTableData.dataRows.push(data[i]);
            }
        }, error => { show403Error(error); });

        setTimeout(() => {

            for (var i in this.broadcastGridTableData.dataRows) {
                id = this.broadcastGridTableData.dataRows[i]['streamId'];
                var $iframe = $('#' + id);
                $iframe.prop('src', this.getIFrameSrc(id, "true", null, null, null));
            }

        }, 1500);
    }

    downloadFile(vodName: string, type: string, vodId: string, streamId: string, filePath: string): void {

        var srcFile = HTTP_SERVER_ROOT + this.appName + "/" + filePath;
        var vodUrlName = vodName;

        const link = document.createElement("a");
        link.download = vodUrlName;
        document.body.appendChild(link);
        link.href = srcFile;
        link.target = '_blank';
        link.click();
    }

    getVoDUrl(filePath: string) {
        return HTTP_SERVER_ROOT + this.appName + "/" + filePath;
    }

    copyVoDUrl(filePath: string) {
        var srcFile = HTTP_SERVER_ROOT + this.appName + "/" + filePath;

        this.clipBoardService.copyFromContent(srcFile);
        $.notify({
            message: "File URL copied to clipboard"
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


    playVoD(vodName: string, type: string, vodId: string, streamId: string, filePath: string): void {

        if (this.appSettings.playTokenControlEnabled || this.appSettings.playJwtControlEnabled) {
            this.playVoDToken(vodName, type, vodId, streamId, filePath);
        }
        else {
            //if filePath has extension, in the new version file path has the full relative path
            //putting the below check to support old versions
            if (filePath.lastIndexOf(".") == -1) {
                filePath += "/" + vodName;
            }
            this.openPlayer(this.getIFrameEmbedCode(vodId), vodId, filePath, "640px", null, vodName, ["vod"], null, null);
        }
    }

    playVoDToken(name: string, type: string, vodId: string, streamId: string, filePath: string): void {
        let tokenParam;

        if (type == "uploadedVod") {
            tokenParam = vodId;
        }
        else if (type == "streamVod") {
            tokenParam = streamId;
        }
        else if (type == "userVod") {
            let extensionIndex = name.lastIndexOf(".mp4");
            tokenParam = name.substring(0, extensionIndex);
        }

        if (this.appSettings.enableTimeTokenForPlay) {
            swal({
                title: "TOTP Playback ",
                text: "TOTP Playback is not currently supported through web panel",
                type: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            }).then(() => {
            }).catch(function () {
            });
        }
        else if (tokenParam != null && this.appSettings.playTokenControlEnabled) {
            this.openPlayerWithOneTimeToken(vodId, filePath, "640px", tokenParam, null, null);
        }
        else if (tokenParam != null && this.appSettings.playJwtControlEnabled) {
            this.openPlayerWithJWTToken(vodId, filePath, "640px", tokenParam, null, null);
        }
        else {
            swal({
                title: "Undefined VoD Type",
                text: "It cannot get token for Undefined VoD type",
                type: 'error',

                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            }).then(() => {
            }).catch(function () {
            });
        }
    }


    openPlayerWithOneTimeToken(id: string, path: string, width: string, tokenParam: string, type: string, hasSubTracks: boolean) {
        let currentUnixTime: number = Math.floor(Date.now() / 1000)
        let expireDate: number = currentUnixTime + 100;

        this.restService.getOneTimeToken(this.appName, tokenParam, expireDate).subscribe(data => {
            this.token = <Token>data;
            this.openPlayer(this.getIFrameEmbedCode(id), id, path, "640px", this.token.tokenId, null, null, type, hasSubTracks)
        }, error => { show403Error(error); });
    }

    openPlayerWithJWTToken(id: string, path: string, width: string, tokenParam: string, type: string, hasSubTracks: boolean) {
        let currentUnixTime: number = Math.floor(Date.now() / 1000)
        let expireDate: number = currentUnixTime + 100;

        this.restService.getJWTToken(this.appName, tokenParam, expireDate).subscribe(data => {
            this.token = <Token>data;
            this.openPlayer(this.getIFrameEmbedCode(id), id, path, "640px", this.token.tokenId, null, null, type, hasSubTracks)
        }, error => { show403Error(error); });
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
            }, error => { show403Error(error); });

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
            }, error => { show403Error(error); });

    }

    deleteLiveBroadcast(streamId: string, broadcastHostAddress: string): void {
        let REMOTE_HOST_ADDRESS;
        let hostAddress = localStorage.getItem('hostAddress');

        swal({
            title: Locale.getLocaleInterface().are_you_sure,
            text: Locale.getLocaleInterface().wont_be_able_to_revert,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(data => {
            this.restService.deleteBroadcast(this.appName, streamId, REMOTE_HOST_ADDRESS)
                .subscribe(data => {
                    if (data["success"] == true) {

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


                }, error => { show403Error(error); });
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

    dropDownChanged(event: any, i: number) {

        if (event == 2880) {
            this.encoderSettings[i].videoBitrate = 8000;
            this.encoderSettings[i].audioBitrate = 320;
        }
        if (event == 2160) {
            this.encoderSettings[i].videoBitrate = 6000;
            this.encoderSettings[i].audioBitrate = 256;
        }
        if (event == 1080) {
            this.encoderSettings[i].videoBitrate = 2500;
            this.encoderSettings[i].audioBitrate = 256;
        }
        if (event == 720) {
            this.encoderSettings[i].videoBitrate = 2000;
            this.encoderSettings[i].audioBitrate = 128;
        }
        if (event == 640) {
            this.encoderSettings[i].videoBitrate = 1800;
            this.encoderSettings[i].audioBitrate = 96;
        }
        if (event == 540) {
            this.encoderSettings[i].videoBitrate = 1500;
            this.encoderSettings[i].audioBitrate = 96;
        }
        if (event == 480) {
            this.encoderSettings[i].videoBitrate = 1000;
            this.encoderSettings[i].audioBitrate = 96;
        }
        if (event == 360) {
            this.encoderSettings[i].videoBitrate = 800;
            this.encoderSettings[i].audioBitrate = 64;
        }
        if (event == 240) {
            this.encoderSettings[i].videoBitrate = 500;
            this.encoderSettings[i].audioBitrate = 32;
        }


    }

    deleteStream(index: number): void {
        this.encoderSettings.splice(index, 1);
    }

    getSettings(): void {
        this.restService.getSettings(this.appName).subscribe(data => {
            this.appSettings = <AppSettings>data;
            this.settingsJson = JSON.stringify(data, null, 2); //JSON.stringify(data);
            if (this.appSettings.jwtControlEnabled) {
                let jwt = require('jsonwebtoken');
                let currentAppJWTToken = jwt.sign({ sub: "token" }, this.appSettings.jwtSecretKey);

                localStorage.setItem(this.appName + 'jwtToken', currentAppJWTToken);
                localStorage.setItem(this.appName + 'jwtControlEnabled', this.appSettings.jwtControlEnabled + "");
            }
            else {
                localStorage.setItem(this.appName + 'jwtToken', null);
                localStorage.setItem(this.appName + 'jwtControlEnabled', "false");
            }
            this.encoderSettings = [];
            this.appSettings.encoderSettings.forEach((value, index) => {
                if (value != null) {
                    this.encoderSettings.push({
                        height: this.appSettings.encoderSettings[index].height,
                        videoBitrate: this.appSettings.encoderSettings[index].videoBitrate / 1000,
                        audioBitrate: this.appSettings.encoderSettings[index].audioBitrate / 1000
                    });

                }
            });

            this.acceptAllStreams = !this.appSettings.acceptOnlyStreamsInDataStore;
            this.getAllStreamData()
            this.callTimer()

        }, error => {
            this.callTimer()
            show403Error(error);
        });
    }


    updateSettingsByJson(): void {
        try {
            this.settingsObject = JSON.parse(this.settingsJson);
        } catch (err) {
            console.error('Invalid JSON:', err);
            // Handle error if the JSON string is invalid
        }
        this.restService.changeSettingsByJson(this.appName, this.settingsObject).subscribe(data => {
            if (data["success"] == true) {
                this.getSettings();
                $.notify({
                    icon: "ti-save",
                    message: Locale.getLocaleInterface().settings_saved
                }, {
                    type: "success",
                    delay: 3000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            } else {
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
                this.getSettings();
            }
        },
            error => {
                if (!show403Error(error)) {
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
                this.getSettings();
            });

    }

    changeSettings(valid: boolean): void {

        if (!valid) {
            return;
        }

        if (this.appSettings.jwtControlEnabled) {
            let jwt = require('jsonwebtoken');
            let currentAppJWTToken = jwt.sign({ sub: "token" }, this.appSettings.jwtSecretKey);

            localStorage.setItem(this.appName + 'jwtToken', currentAppJWTToken);
            localStorage.setItem(this.appName + 'jwtControlEnabled', this.appSettings.jwtControlEnabled + "");
        }
        else {
            localStorage.setItem(this.appName + 'jwtToken', null);
            localStorage.setItem(this.appName + 'jwtControlEnabled', "false");
        }

        if (!this.appSettings.s3RecordingEnabled) {
            this.appSettings.s3AccessKey = "";
            this.appSettings.s3SecretKey = "";
            this.appSettings.s3BucketName = "";
            this.appSettings.s3Endpoint = "";
            this.appSettings.s3RegionName = "";
        }

        this.appSettings.encoderSettings = [];

        this.encoderSettings.forEach((value, index) => {
            if (value != null) {
                this.appSettings.encoderSettings.push({
                    height: this.encoderSettings[index].height,
                    videoBitrate: this.encoderSettings[index].videoBitrate * 1000,
                    audioBitrate: this.encoderSettings[index].audioBitrate * 1000
                });

            }
        });

        this.appSettings.remoteAllowedCIDR = this.appSettings.remoteAllowedCIDR.trim();

        if (this.appSettings.remoteAllowedCIDR == "") {
            this.appSettings.remoteAllowedCIDR = "127.0.0.1";
        }

        this.appSettings.acceptOnlyStreamsInDataStore = !this.acceptAllStreams;

        if (this.appSettings.vodFolder.endsWith("/")) {
            this.appSettings.vodFolder = this.appSettings.vodFolder.substring(0, this.appSettings.vodFolder.length - 1);
        }

        this.restService.changeSettings(this.appName, this.appSettings).subscribe(data => {
            if (data["success"] == true) {
                $.notify({
                    icon: "ti-save",
                    message: Locale.getLocaleInterface().settings_saved
                }, {
                    type: "success",
                    delay: 3000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
                this.getSettings();
            } else {
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
                this.getSettings();
            }

            this.appSettings.encoderSettings.forEach((value, index) => {
                if (value != null) {
                    this.appSettings.encoderSettings[index].videoBitrate /= 1000;
                    this.appSettings.encoderSettings[index].audioBitrate /= 1000;
                }
            });

        },
            error => {
                if (!show403Error(error)) {
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
                this.getSettings();
            });


    }

    settingModeChanged(event: any) {
        console.log("event:" + event);
        if (event == "setByForm") {
            this.isJsonUpdate = false;
        }
        else if (event == "setByJson") {
            this.isJsonUpdate = true;
        }
    }

    newLiveStream(): void {
        this.shareEndpoint = [];
        this.newLiveStreamActive = true;
        this.newIPCameraActive = false;
        this.newStreamSourceActive = false;
        this.streamNameEmpty = false;
        this.newPlaylistActive = false;
        this.liveBroadcast = new LiveBroadcast();
    }

    newIPCamera(): void {
        this.shareEndpoint = [];
        this.newLiveStreamActive = false;
        this.newIPCameraActive = true;
        this.newStreamSourceActive = false;
        this.streamNameEmpty = false;
        this.newPlaylistActive = false;
        this.liveBroadcast = new LiveBroadcast();
    }

    newStreamSource(): void {
        this.shareEndpoint = [];
        this.newLiveStreamActive = false;
        this.newIPCameraActive = false;
        this.newStreamSourceActive = true;
        this.streamNameEmpty = false;
        this.newPlaylistActive = false;
        this.liveBroadcast = new LiveBroadcast();
    }

    newPlaylist(): void {
        this.newLiveStreamActive = false;
        this.newIPCameraActive = false;
        this.newStreamSourceActive = false;
        this.newPlaylistActive = true;
        this.streamNameEmpty = false;
        this.liveBroadcast = new LiveBroadcast();

        //we need to call it after it's visible
        this.initDateTimePicker();
    }

    initDateTimePicker() {
        setTimeout(() => {
            if ($('.datetimepickerAddPlaylist').length) {
                $('.datetimepickerAddPlaylist').datetimepicker({
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
                    },
                    format: "MMM DD YYYY hh:mm A",
                    date: ""
                });

                $('.datetimepickerAddPlaylist').hide();
            }
            else {
                this.initDateTimePicker();
            }
        }, 250);
    }


    checkIPCameraError(streamId: string): void {

        this.restService.getCameraError(this.appName, streamId).subscribe(data => {

            console.log("stream ID :  " + streamId);

            if (data["success"] == false) {

                if (data["message"] != null && data["message"].includes("401")) {

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
                else {
                    swal({
                        title: "Camera Error",
                        text: "An unknown error occured for your IP Camera. Please report this case to support@antmedia.io with your logs and IP camera address",
                        type: 'error',

                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    }).then(() => {

                    }).catch(function () {

                    });
                }
            }
            else {
                console.log("no  camera error")
            }

            this.liveBroadcast.ipAddr = "";
        }, error => { show403Error(error); });
    }


    addIPCamera(isValid: boolean): void {
        this.streamNameEmpty = false;

        if (!isValid) {
            //not valid form return directly
            return;
        }

        if (!this.restService.checkStreamName(this.liveBroadcast.name)) {
            this.streamNameEmpty = true;
            return;
        }
        this.newIPCameraAdding = true;
        this.liveBroadcast.type = "ipCamera";


        var socialNetworks = [];

        this.shareEndpoint.forEach((value, index) => {
            if (value === true) {
                socialNetworks.push(this.videoServiceEndpoints[index].id);
            }
        });
        this.restService.createLiveStream(this.appName, this.liveBroadcast, null, socialNetworks.join(","))
            .subscribe(data => {
                //console.log("data :" + JSON.stringify(data));
                this.newIPCameraAdding = false;
                if (data["success"] == true || data["streamId"] != null) {

                    console.log("success: " + data["success"]);
                    console.log("error: " + data["message"]);

                    this.newIPCameraActive = false;

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

                    //call 5 seconds later to let IP camera start
                    setTimeout(() => {
                        this.checkIPCameraError(data["dataId"]);
                    }, 5000);
                }
                else {

                    console.log("success: " + data["success"]);
                    console.log("message: " + data["message"]);

                    var errorCode = data["errorId"];
                    if (errorCode == -1) {

                        swal({
                            title: "Connection Error",
                            text: "Please Check Camera URL",
                            type: 'error',

                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'OK'
                        }).then(() => {


                        }).catch(function () {

                        });
                    }
                    else if (errorCode == -2) {

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
                    else if (errorCode == -3) {

                        swal({
                            title: "High CPU Load",
                            text: "Please Decrease CPU Load Then Try Again",
                            type: 'error',

                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'OK'
                        }).then(() => {


                        }).catch(function () {

                        });
                    }

                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getAppLiveStreamsNumber();
                }
            },
                error => {
                    this.newIPCameraAdding = false;

                    if (show403Error(error) == false) {
                        $.notify({
                            icon: "ti-save",
                            message: typeof error.error["message"] != "undefined" ? error.error["message"] : "Unknown problem. Reach to technical support(support@antmedia.io)"
                        }, {
                            type: "warning",
                            delay: 2000,
                            placement: {
                                from: 'top',
                                align: 'right'
                            }
                        });
                    }
                });
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

        if (!this.restService.checkStreamUrl(this.liveBroadcast.streamUrl)) {
            console.log("stream source address is not in correct format");
            this.streamUrlValid = false;
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

        let REMOTE_HOST_ADDRESS = null;
        let hostAddress = localStorage.getItem('hostAddress');

        this.restService.createLiveStream(this.appName, this.liveBroadcast, REMOTE_HOST_ADDRESS, socialNetworks.join(","))
            .subscribe(data => {

                if (data["success"] == true || data["streamId"] != null) {
                    this.jwtTokenValid = true;
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
                    this.streamUrlValid = true;
                }
                else {
                    var errorCode = data["message"];

                    this.jwtTokenValid = false;
                    this.newIPCameraAdding = false;
                    this.newStreamSourceAdding = false;

                    $.notify({
                        icon: "ti-save",
                        message: "Failed. Error is " + data["message"]
                    }, {
                        type: "danger",
                        delay: 2000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getAppLiveStreamsNumber();

                    if (errorCode == -3) {

                        swal({
                            title: "High CPU Load",
                            text: "Please Decrease CPU Load Then Try Again",
                            type: 'error',

                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'OK'
                        }).then(() => {
                        }).catch(function () {
                        });
                    }
                }
                //swal.close();
                this.newStreamSourceAdding = false;
                this.newStreamSourceActive = false;
                this.liveBroadcast.name = "";
                this.liveBroadcast.ipAddr = "";
                this.liveBroadcast.username = "";
                this.liveBroadcast.password = "";

            },
                error => {
                    this.newStreamSourceAdding = false;

                    if (show403Error(error) == false) {
                        $.notify({
                            icon: "ti-save",
                            message: typeof error.error["message"] != "undefined" ? error.error["message"] : "Unknown problem. Reach to technical support(support@antmedia.io)"
                        }, {
                            type: "warning",
                            delay: 2000,
                            placement: {
                                from: 'top',
                                align: 'right'
                            }
                        });
                    }
                }
            );
    }
    addPlaylistItem(): void {

        this.liveBroadcast.playListItemList.push({
            streamUrl: "",
            type: "VoD",
            seekTimeInMs: 0,
            durationInMs: 0,
            name: ""
        });

    }

    scheduleToStartChanged(value) {
        console.log("scheduleToStartChanged ", value);

        if (this.scheduleToStart) {
            $('.datetimepickerAddPlaylist').show();
        }
        else {
            $('.datetimepickerAddPlaylist').hide();
        }

    }

    addPlaylistItemDirectly() {
        this.directUrlAdding = true;
        this.vodAdding = false;
        this.playListItemAdding = new PlaylistItem();

    }

    addPlaylistItemDirectlyClicked() {
        this.playlistItemAddingActive = true;

        this.restService.getDurationInMilliseconds(this.appName, this.playListItemAdding.streamUrl).subscribe(data => {

            this.playlistItemAddingActive = false;
            if (data["success"]) {

                this.addVodToPlaylistItemList(this.playListItemAdding.streamUrl, this.playListItemAdding.name, Number(data["dataId"]))


                this.directUrlAdding = false;
            }
            else {
                if (data["errorId"] == -1) {
                    //duration cannot be found, it may happen
                    this.liveBroadcast.playListItemList.push({
                        type: "VoD",
                        streamUrl: this.playListItemAdding.streamUrl,
                        name: this.playListItemAdding.name,
                        seekTimeInMs: 0,
                        durationInMs: Number(data["dataId"])

                    });
                }
                else {
                    if (data["errorId"] == -2) {
                        swal({
                            title: "Warning",
                            text: "The URL is inaccessible. If you're adding a local file and token security is enabled for play in the app, ensure to add a play token to the URL.",
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        })
                    }
                    else {
                        swal({
                            title: "Warning",
                            text: "Stream format cannot be found in this url",
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        })
                    }
                }

            }
        }, error => {
            this.playlistItemAddingActive = false;
            this.directUrlAdding = false;
        });
    }

    addPlaylistItemFromVoDs() {
        this.directUrlAdding = false;
        this.vodAdding = true;
        this.playListItemAdding = new PlaylistItem();

    }

    applyFilterPlaylistVod(filterValue) {
        if (this.filterValuePlaylistVoD != filterValue && filterValue.length > 3) {
            this.filterValuePlaylistVoD = filterValue.toLowerCase(); // Datasource defaults to lowercase matches

            this.restService.getVodList(this.appName, 0, 20, "", "", this.filterValuePlaylistVoD).subscribe(data => {
                this.vodTableDataForPlaylist.dataRows = [];
                for (var i in data) {
                    this.vodTableDataForPlaylist.dataRows.push(data[i]);
                    console.log(data[i]);
                }
                this.dataSourcePlaylistVod = new MatTableDataSource(this.vodTableDataForPlaylist.dataRows);
            }, error => { show403Error(error); });


        }
    }

    selectHandlerStreamsPlayListVoD(vodId: string) {
        this.selectionPlaylistVoDs.toggle(vodId);
    }
    
    async addPlaylistItemFromVoDsClicked() {
        if (this.selectionPlaylistVoDs.isEmpty()) {

            swal({
                title: "Warning",
                text: "Please Select VoD to Add the Playlist",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            })
            return;
        }

        for (let item of this.dataSourcePlaylistVod.data) {
            if (this.selectionPlaylistVoDs.isSelected(item.vodId)) {
                let url = HTTP_SERVER_ROOT + this.appName + "/" + item.filePath;

                if (this.appSettings.playJwtControlEnabled) {
                    try {
                        const tokenData = await this.restService.getJWTToken(this.appName, item.vodId, INFINITE_JWT_EXPIRE_DATE).toPromise();
                        const jwt = <Token>tokenData;
                        
                        url += `?token=${jwt.tokenId}`;
                    } catch (error) {
                        show403Error(error);
                        continue;
                    }
                }
    
                this.addVodToPlaylistItemList(url, item.vodName, item.duration);
            }
        }

        this.vodAdding = false;
        this.selectionPlaylistVoDs.clear();
        this.vodTableDataForPlaylist.dataRows = [];
        this.dataSourcePlaylistVod = new MatTableDataSource(this.vodTableDataForPlaylist.dataRows);

    }

    addVodToPlaylistItemList(url:string, vodName:string, duration:number){

        this.liveBroadcast.playListItemList.push({
            type: "VoD",
            streamUrl: url,
            name: vodName,
            seekTimeInMs: 0,
            durationInMs: duration
        });

    }

    cancelAddingPlayListItem() {
        this.directUrlAdding = false;
        this.vodAdding = false;
        this.vodTableDataForPlaylist.dataRows = [];
        this.dataSourcePlaylistVod = new MatTableDataSource(this.vodTableDataForPlaylist.dataRows);
    }

    isTimeFormatCorrect(index: number): boolean {
        // Undefined means not yet checked, which we treat as valid until checked
        return this.timeFormatValidity[index] !== false;
    }

    // Convert HH:MM:SS to milliseconds
    convertToMilliseconds(time) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return ((hours * 60 + minutes) * 60 + seconds) * 1000;
    }

    seekTimeChanged(newValue, index) {
        var value = this.convertToMilliseconds(newValue);
        if (!isNaN(value)) {
            this.liveBroadcast.playListItemList[index].seekTimeInMs = value;
            this.timeFormatValidity[index] = true;
        }
        else {
            this.timeFormatValidity[index] = false;
        }
    }

    deletePlaylistItem(index: number): void {
        this.liveBroadcast.playListItemList.splice(index, 1);
    }

    addPlaylist(isValid: boolean): void {

        this.playlistNameEmpty = false;

        if (!isValid) {
            //not valid form return directly
            return;
        }

        if (!this.restService.checkStreamName(this.liveBroadcast.name)) {
            this.playlistNameEmpty = true;
            return;
        }
        this.liveBroadcast.type = "playlist";

        this.playlistNameEmpty = false;
        this.newPlaylistAdding = true;

        if (this.scheduleToStart && $('.datetimepickerAddPlaylist').val() != "") {
            this.liveBroadcast.plannedStartDate = new Date($('.datetimepickerAddPlaylist').data("DateTimePicker").viewDate()).getTime() / 1000;
        }
        else {
            this.liveBroadcast.plannedStartDate = 0;
        }

        this.restService.createLiveStream(this.appName, this.liveBroadcast, null, "")
            .subscribe(data => {
                console.log("data :" + JSON.stringify(data));
                if (data["streamId"] != null) {

                    this.newPlaylistAdding = false;

                    //  this.playlist = new Playlist ();

                    //  this.playlistItems = [];
                    //  this.playlist.broadcastItemList = [];

                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().new_playlist_created
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

                }
                else {
                    var errorCode = data["message"];

                    $.notify({
                        icon: "ti-save",
                        message: Locale.getLocaleInterface().new_playlist_error
                    }, {
                        type: "danger",
                        delay: 2000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                    this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                    this.getAppLiveStreamsNumber();

                    if (errorCode == -3) {

                        swal({
                            title: "High CPU Load",
                            text: "Please Decrease CPU Load Then Try Again",
                            type: 'error',

                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'OK'
                        }).then(() => {


                        }).catch(function () {

                        });
                    }

                }

                //swal.close();
                this.newPlaylistAdding = false;
                this.newPlaylistActive = false;

            },
                error => {
                    this.newPlaylistAdding = false;

                    if (show403Error(error) == false) {
                        $.notify({
                            icon: "ti-save",
                            message: typeof error.error["message"] != "undefined" ? error.error["message"] : "Unknown problem. Reach to technical support(support@antmedia.io)"
                        }, {
                            type: "warning",
                            delay: 2000,
                            placement: {
                                from: 'top',
                                align: 'right'
                            }
                        });
                    }
                });

    }

    setJwtRestFilterString(length: number) {
        // Declare all characters
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        // Pick characers randomly
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        this.appSettings.jwtSecretKey = str;
        return str;
    };


    setJwtStreamFilterString(length: number) {
        // Declare all characters
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        // Pick characers randomly
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        this.appSettings.jwtStreamSecretKey = str;
        return str;
    };

    setTOTPSecretForPlaying(length: number) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        // Pick characers randomly
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        this.appSettings.timeTokenSecretForPlay = str;
        return str;
    }

    setTOTPSecretForPublishing(length: number) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        // Pick characers randomly
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        this.appSettings.timeTokenSecretForPublish = str;
        return str;
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

                }
                else {
                    this.discoveryStarted = false;
                    this.noCamWarning = true;
                    this.camera.ipAddr = "";
                }
            }
            else {
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
                show403Error(error);
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

        if (!this.restService.checkStreamName(this.liveBroadcast.name)) {

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
        this.restService.createLiveStream(this.appName, this.liveBroadcast, null, socialNetworks.join(","))
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

            },
                error => {
                    this.newLiveStreamCreating = false;
                    if (show403Error(error) == false) {
                        $.notify({
                            icon: "ti-save",
                            message: typeof error.error["message"] != "undefined" ? error.error["message"] : "Unknown problem. Reach to technical support(support@antmedia.io)"
                        }, {
                            type: "warning",
                            delay: 2000,
                            placement: {
                                from: 'top',
                                align: 'right'
                            }
                        });
                    }

                });

    }

    switchToListView(): void {

        this.getAppLiveStreams(0, 5);

        var container = document.getElementById('cbp-vm'),
            optionSwitch = Array.prototype.slice.call(container.querySelectorAll('div.cbp-vm-options > a'));


        optionSwitch.forEach(function (el, i) {
            el.addEventListener('click', function () {

                change(this);



            });
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

        setTimeout(() => {
            this.openGridPlayers(0, 4);
        }, 500);
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

    cancelPlaylist(): void {
        this.newPlaylistActive = false;
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

    setRecordingStatus(streamId: string, recordingStatus: boolean, recordingType: string): void {

        //Check H.264 is disabled
        if (!this.appSettings.h264Enabled && recordingType == "mp4" && recordingStatus) {
            $.notify({
                icon: "ti-save",
                message: "Firstly, please enable H.264 Encoder in App Settings"
            }, {
                type: "warning",
                delay: 3000,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });
            return;
        }
        //Check WebM settings is disabled
        if (!this.appSettings.vp8Enabled && recordingType == "webm" && recordingStatus) {
            $.notify({
                icon: "ti-save",
                message: "Firstly, please enable VP8 Encoder in App Settings"
            }, {
                type: "warning",
                delay: 3000,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });
            return;
        }

        this.restService.setStreamRecordingStatus(this.appName, streamId, recordingStatus, recordingType).subscribe(data => {
            if (data["success"] == true) {

                if (recordingStatus) {
                    var recordingMessage = "starting";
                }
                else {
                    var recordingMessage = "stopping";
                }

                this.getAppLiveStreams(this.streamListOffset, this.pageSize);

                $.notify({
                    icon: "ti-save",
                    message: recordingType + " recording is " + recordingMessage + ". Please wait few seconds."
                }, {
                    type: "success",
                    delay: 1000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
            else {
                $.notify({
                    icon: "ti-save",
                    message: "Operation has failed"
                }, {
                    type: "warning",
                    delay: 3000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
        }, error => { show403Error(error); });

    }

    copyLiveEmbedCode(streamUrl: string): void {

        //if (this.isEnterpriseEdition) {
        //  streamUrl += "_adaptive";
        //}

        let embedCode = '<iframe width="560" height="315" src="'
            + HTTP_SERVER_ROOT + this.appName + "/play.html?id=" + streamUrl
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

    copyVoDEmbedCode(name: string, type: string, vodId: string, filePath: string): void {

        //if filePath has extension, in the new version file path has the full relative path
        //putting the below check to support old versions
        if (filePath.lastIndexOf(".") == -1) {
            filePath += "/" + name;
        }

        let embedCode = '<iframe width="560" height="315" src="'
            + HTTP_SERVER_ROOT + this.appName + "/play.html?id=" + filePath + "&playOrder=vod"
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

    getFormattedTime(milliseconds) {
        if (milliseconds && Number(milliseconds) > 0) {
            let seconds = Math.floor(milliseconds / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            seconds = seconds % 60;
            minutes = minutes % 60;
            // Formatting to HH:MM:SS
            return [hours, minutes, seconds].map(val => val.toString().padStart(2, '0')).join(':');
        }
        else {
            return "00:00:00";
        }
    }

    getPlayListCurrentTime(playListBroadcast: LiveBroadcast): string {
        //we know the each file duration and current play index and current status of the playing index
        var i;
        var previousPassedTimeInMs = 0;
        for (i = 0; i < playListBroadcast.currentPlayIndex; i++) {
            previousPassedTimeInMs += playListBroadcast.playListItemList[i].durationInMs;
        }

        //add current duration
        console.log("current duration:" + playListBroadcast.duration + " playlistbroadcast.time:" + playListBroadcast.streamId);
        previousPassedTimeInMs += playListBroadcast.duration;
        return this.getFormattedTime(previousPassedTimeInMs);

    }

    getPlayListDuration(playlistBroadcast: LiveBroadcast): string {

        var totalDurationInMs = 0;
        playlistBroadcast.playListItemList.forEach((item) => {
            totalDurationInMs += item.durationInMs - item.seekTimeInMs;
        });
        return this.getFormattedTime(totalDurationInMs);
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
                show403Error(error);
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
                show403Error(error);
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
                show403Error(error);
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
                show403Error(error);
            },
        );
    }

    webrtcStats(broadcast: LiveBroadcast) {
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


    openRTMPEndpointDialog(stream: BroadcastInfo): void {

        if (this.liveStreamEditing == null || stream.streamId != this.liveStreamEditing.streamId || stream.name != this.liveStreamEditing.name) {
            this.liveStreamEditing = new LiveBroadcast();
            this.liveStreamEditing.streamId = stream.streamId;
            this.liveStreamEditing.name = stream.name;
            this.liveStreamEditing.description = "";
        }


        if (this.liveStreamEditing) {
            let dialogRef = this.dialog.open(RtmpEndpointEditDialogComponent, {

                height: '300px',
                maxHeight: '500px',
                width: '600px',
                maxWidth: '600px',

                data: {
                    name: this.liveStreamEditing.name,
                    streamId: this.liveStreamEditing.streamId,
                    appName: this.appName,
                    endpointList: stream.endPointList,
                }

            });


            dialogRef.afterClosed().subscribe(result => {
                this.getAppLiveStreams(this.streamListOffset, this.pageSize);
                this.getAppLiveStreamsNumber();
            });

        }
    }

    stopStreams(streamId: string): void {

        this.restService.stopStream(this.appName, streamId).subscribe(data => {

            if (data["success"] == true) {

                $.notify({
                    icon: "ti-save",
                    message: "Stream's stopping, please wait a few seconds."
                }, {
                    type: "success",
                    delay: 3000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
            else {

                $.notify({
                    icon: "ti-save",
                    message: "Stream stop is failed.<br/>Error: " + data["message"]
                }, {
                    type: "warning",
                    delay: 3000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
            this.callTimer();
        }, error => { show403Error(error); });

    }

    startStreams(streamId: string): void {

        this.restService.startStream(this.appName, streamId).subscribe(data => {

            if (data["success"] == true) {

                $.notify({
                    icon: "ti-save",
                    message: "Stream's starting, please wait a few seconds."
                }, {
                    type: "success",
                    delay: 3000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
            else {

                $.notify({
                    icon: "ti-save",
                    message: "Stream Start Failed.<br/>Error: " + data["message"]
                }, {
                    type: "warning",
                    delay: 5000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });

            }
            this.callTimer();
        }, error => { show403Error(error); });
    }

    selectHandlerVod(vodId: string) {
        this.selectionVods.toggle(vodId);
    }

    isAllVodsSelected() {
        return this.dataSourceVod.data.every(row => this.selectionVods.isSelected(row.vodId));
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggleVods() {
        if (this.isAllVodsSelected()) {
            this.dataSourceVod.data.forEach(row => this.selectionVods.deselect(row.vodId));
        } else {
            this.dataSourceVod.data.forEach(row => this.selectionVods.select(row.vodId));
        }
    }


    deleteSelectedVoDs(): void {
        if (this.selectionVods.isEmpty()) {

            swal({
                title: "Warning",
                text: "Please Select Streams to Delete",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            })
            return;
        }

        swal({
            title: Locale.getLocaleInterface().are_you_sure,
            text: Locale.getLocaleInterface().wont_be_able_to_revert,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete them!'
        }).then(() => {

            let vods: Array<string> = [];

            for (let i of Object.keys(this.dataSourceVod.data)) {

                if (this.selectionVods.isSelected(this.dataSourceVod.data[i].vodId)) {
                    vods.push(this.dataSourceVod.data[i].vodId);
                }

            }
            this.restService.deleteVoDFiles(this.appName, vods).subscribe(data => {
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

                    this.selectionVods.clear();
                }
                else {
                    this.showVoDFileNotDeleted();
                }
                this.getVoDStreams();
            }, error => { show403Error(error); });
        }).catch(function () {

        });
    }

    selectHandlerStreams(streamId: string) {
        this.selectionStreams.toggle(streamId);
    }

    isAllStreamsSelected() {
        return this.dataSource.data.every(row => this.selectionStreams.isSelected(row.streamId));
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggleStreams() {
        if (this.isAllStreamsSelected()) {
            this.dataSource.data.forEach(row => this.selectionStreams.deselect(row.streamId));
        } else {
            this.dataSource.data.forEach(row => this.selectionStreams.select(row.streamId));
        }
    }

    onPublishTokenControlChange() {
        this.cdr.detectChanges();

        if (this.appSettings.publishTokenControlEnabled) {
            this.appSettings.publishJwtControlEnabled = false;
            this.appSettings.enableTimeTokenForPublish = false;
        }


    }

    onPlayTokenControlChange() {
        this.cdr.detectChanges();

        if (this.appSettings.playTokenControlEnabled) {
            this.appSettings.playJwtControlEnabled = false;
            this.appSettings.enableTimeTokenForPlay = false
        }


    }

    onEnableTimeTokenForPublishChange() {

        this.cdr.detectChanges();



        if (this.appSettings.enableTimeTokenForPublish) {
            this.appSettings.publishJwtControlEnabled = false;
            this.appSettings.publishTokenControlEnabled = false;
        }

    }

    onEnableTimeTokenForPlayChange() {
        this.cdr.detectChanges();

        if (this.appSettings.enableTimeTokenForPlay) {
            this.appSettings.playJwtControlEnabled = false;
            this.appSettings.playTokenControlEnabled = false
        }

    }

    onPublishJwtControlEnabledChange() {
        this.cdr.detectChanges();

        if (this.appSettings.publishJwtControlEnabled) {
            this.appSettings.enableTimeTokenForPublish = false;
            this.appSettings.publishTokenControlEnabled = false;
        }

    }

    onPlayJwtControlEnabledChange() {
        this.cdr.detectChanges();

        if (this.appSettings.playJwtControlEnabled) {
            this.appSettings.enableTimeTokenForPlay = false;
            this.appSettings.playTokenControlEnabled = false
        }

    }


    deleteSelectedStreams(): void {

        if (this.selectionStreams.isEmpty()) {

            swal({
                title: "Warning",
                text: "Please Select Streams to Delete",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            })
            return;
        }

        swal({
            title: Locale.getLocaleInterface().are_you_sure,
            text: Locale.getLocaleInterface().wont_be_able_to_revert,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete them!'
        }).then(data => {

            let streams: Array<string> = [];

            for (let i of Object.keys(this.dataSource.data)) {

                if (this.selectionStreams.isSelected(this.dataSource.data[i].streamId)) {
                    streams.push(this.dataSource.data[i].streamId);
                }

            }

            this.restService.deleteBroadcasts(this.appName, streams, null)
                .subscribe(data => {
                    if (data["success"] == true) {

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

                        this.selectionStreams.clear();

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


                }, error => { show403Error(error); });
        })
            .catch(function () {
            });

    }

    formatTime(milliseconds: number): string {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);
        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);
    
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);
    
        return parts.join(' ');
      }

      getBitrateInKbps(bitrate: number): number {
        return Math.floor(bitrate / 1000); 
      }


      getStreamHealthColor(broadcast:LiveBroadcast) {

         if (broadcast.packetLostRatio > 0.02 || broadcast.rttMs > 100 || broadcast.jitterMs > 50 ||
            broadcast.pendingPacketSize > 15 || broadcast.encoderQueueSize > 15 || (broadcast.speed > 0 && broadcast.speed < 0.7)) 
         {
            return "#FFC107";
         }
         else 
         {
            return "#28a745"
         }

      }

      getStreamDiagnose(broadcast:LiveBroadcast) {
        var text = "";

        if (broadcast.packetLostRatio > 0.01) {
            text += "- Packet loss ratio exceeds %1 percent. This likely indicates an issue with the broadcaster's network."
                    + "Recommend switching to a network with higher QoS anor using a stable Wireless connection.\n"
        }

        if (broadcast.rttMs > 100) {
            text += "- RTT exceeds 100ms, indicating a potential issue with the broadcaster's network."
                    + "Recommend using a network with better stability and lower latency.\n"
        }

        if (broadcast.jitterMs > 50) {
            text += "- Jitter exceeds 50ms, suggesting a potential issue with the broadcaster's network."
                    + "Recommend using a more stable network to improve performance.\n";
        }

        if (broadcast.pendingPacketSize > 15) {
            text += "- Input queue size exceeds 15, indicating that the server may be overloaded and struggling to process packets efficiently."
                    + "Consider scaling the server horizontally or vertically, or reducing the number of incoming streams to alleviate the load.\n"
        }

        if (broadcast.encoderQueueSize > 15) {
            text += "- Encoding queue size exceeds 15, indicating that the encoder(CPU or GPU) may be overloaded and struggling to process tasks efficiently."
                    + "Consider scaling the server horizontally or vertically, or reducing the number of incoming streams to alleviate the load.\n"
        }

        if (broadcast.speed > 0 && broadcast.speed < 0.7) {
            text += "- Speed is below 0.7(should be around 1.0x), which may indicate an issue with the broadcaster's network."
                    + "Consider troubleshooting the network or switching to a higher-quality connection.\n"
        }

        return text;
      }

      getStatInfo(broadcast:LiveBroadcast) {

        var content = "";
        var diagnoseText = this.getStreamDiagnose(broadcast);

        if (diagnoseText != "") {
            content += "Stream is having some issues. Please check the diagnose information below.\n"
            content += diagnoseText + "\n\n";
            content += "Stats:\n";
        }

        if (broadcast.width > 0 && broadcast.height > 0) {
            content += "Resolution: " + broadcast.width + "x" + broadcast.height + "\n";
        }

        if (broadcast.bitrate > 0) {
            content += "Bitrate: " + this.getBitrateInKbps(broadcast.bitrate) + "kbps\n";
        }

        if (broadcast.duration > 0) {
            content += "Duration: " + this.formatTime(broadcast.duration) + "\n";
        }

        if (broadcast.pendingPacketSize > 0) {
            content += "Input Queue Size: " + broadcast.pendingPacketSize + "\n";
        }

        if (broadcast.packetsLost > 0) {
            content += "Packets Lost: " + broadcast.packetsLost + "\n";
        }

        if (broadcast.encoderQueueSize > 0) {
            content += "Encoding Queue Size: " + broadcast.encoderQueueSize + "\n";
        }

        if (broadcast.rttMs > 0) {
            content += "RTT: " + broadcast.rttMs + " ms\n";
        }

        if (broadcast.jitterMs > 0) {
            content += "Jitter: " + broadcast.jitterMs + " ms\n";
        }

        if (broadcast.dropPacketCountInIngestion > 0) {
            content += "Dropped Packets: " + broadcast.dropPacketCountInIngestion + "\n";
        }

        if (broadcast.dropFrameCountInEncoding > 0) {
            content += "Dropped Frames: " + broadcast.dropFrameCountInEncoding + "\n";
        }

        return content;
      }


}
