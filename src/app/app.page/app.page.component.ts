import { Component, OnInit, OnDestroy, Renderer } from '@angular/core';
//import * as Chartist from 'chartist';
//import * as ChartistPlugins from 'chartist-plugin-fill-donut';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { SERVER_ADDR, REST_SERVICE_ROOT, HTTP_SERVER_ROOT } from '../rest/rest.service';
import { RestService, LiveBroadcast } from '../rest/rest.service';
import { ClipboardService } from 'ngx-clipboard';
import { Locale } from "../locale/locale";



declare var $: any;
declare var Chartist: any;
declare var swal: any;


//declare var flowplayer: any;

declare interface Endpoint {
    type: string;
}

declare interface BroadcastInfo {
    name: string;
    streamId: string;
    viewerCount: number;
    status: string;
    endPointList: Endpoint[];
}

declare interface EncoderSettings {
    height: Number;
    videoBitrate: Number;
    audioBitrate: Number;
}

declare interface BroadcastInfoTable {
    dataRows: BroadcastInfo[];
}

declare function require(name: string);
var flowplayer = require('flowplayer');
var engine = require('flowplayer-hlsjs');
engine(flowplayer);

export class HLSListType {
    constructor(public name: string, public value: string) {
    }
}

export class AppSettings {

    constructor(public mp4MuxingEnabled: boolean,
                public addDateTimeToMp4FileName: boolean,
                public hlsMuxingEnabled: boolean,
                public hlsListSize: Number,
                public hlsTime: Number,
                public hlsPlayListType: string,

                public facebookClientId: string,
                public facebookClientSecret: string,

                public youtubeClientId: string,
                public youtubeClientSecret: string,

                public periscopeClientId: string,
                public periscopeClientSecret: string,
                public encoderSettings: EncoderSettings[],
                public acceptOnlyStreamsInDataStore: boolean) {

    }
}

export class SocialNetworkChannel {
    public type: string;
    public name: string;
    public id: string;
}

export class SocialMediAuthStatus {
    public isFacebookAuthenticated: boolean;
    public isPeriscopeAuthenticated: boolean;
    public isYoutubeAuthenticated: boolean;

    public facebookPublishChannel: SocialNetworkChannel;
}

@Component({
    selector: 'manage-app-cmp',
    moduleId: module.id,
    templateUrl: 'app.page.component.html',
    styleUrls: ['app.page.component.css'],

})


export class AppPageComponent implements OnInit, OnDestroy {

    public appName: string;
    public sub: any;
    public broadcastTableData: BroadcastInfoTable;
    public vodTableData: BroadcastInfoTable;
    public timerId: any;
    public checkAuthStatusTimerId: any;
    public socialMediaAuthStatus: SocialMediAuthStatus;
    public newLiveStreamActive: boolean;
    public liveBroadcast: LiveBroadcast;
    public liveBroadcastShareFacebook: boolean;
    public liveBroadcastShareYoutube: boolean;
    public liveBroadcastSharePeriscope: boolean;
    public newLiveStreamCreating = false;
    public isEnterpriseEdition = false;
    public gettingPeriscopeParameters = false;
    public gettingYoutubeParameters = false;
    public gettingFacebookParameters = false;
    public waitingForPeriscopeToBeAuthorized = false;
    public waitingForYoutubeToBeAuthorized = false;
    public waitingForFacebookToBeAuthorized = false;
    public userFBPagesLoading = false;



    public appSettings: AppSettings; // = new AppSettings(false, true, true, 5, 2, "event", "no clientid", "no fb secret", "no youtube cid", "no youtube secre", "no pers cid", "no pers sec");

    public listTypes = [
        new HLSListType('None', ''),
        new HLSListType('Event', 'event'),
    ];

    constructor(private http: HttpClient, private route: ActivatedRoute,
                private restService: RestService,
                private clipBoardService: ClipboardService, private renderer: Renderer,
                public router: Router) { }

    ngOnInit() {

        this.broadcastTableData = {
            dataRows: [
            ],
        };
        this.vodTableData = {
            dataRows: [
            ]
        };

        this.socialMediaAuthStatus = new SocialMediAuthStatus();
        this.liveBroadcast = new LiveBroadcast();

        this.liveBroadcast.name = "";
        this.liveBroadcastShareFacebook = false;
        this.liveBroadcastShareYoutube = false;
        this.liveBroadcastSharePeriscope = false;

        this.appSettings = null;
        this.newLiveStreamActive = false;

    }

    ngAfterViewInit() {

        this.sub = this.route.params.subscribe(params => {
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

            this.getAppLiveStreams();
            this.getVoDStreams();
            this.getSettings();
            this.restService.isEnterpriseEdition().subscribe(data => {
                this.isEnterpriseEdition = data["success"];
            })

            this.timerId = window.setInterval(() => {
                this.getAppLiveStreams();
                this.getVoDStreams();
            }, 10000);

        });

    }

    getAppLiveStreams(): void {
        this.restService.getAppLiveStreams(this.appName, 0, 10).subscribe(data => {
            //console.log(data);
            this.broadcastTableData.dataRows = [];
            console.log("type of data -> " + typeof data);

            for (var i in data) {


                var endpoint = [];
                for (var j in data[i].endPointList) {
                    endpoint.push(data[i].endPointList[j]);
                }

                // data[i].endPointList = endpoint;


                this.broadcastTableData.dataRows.push(data[i]);

            }
            setTimeout(function () {
                $('[data-toggle="tooltip"]').tooltip();
            }, 500);

        });
    }

    getVoDStreams(): void {
        this.http.get(REST_SERVICE_ROOT + '/getAppVoDStreams/' + this.appName).subscribe(data => {
            this.vodTableData.dataRows = [];
            for (var i in data) {
                this.vodTableData.dataRows.push(data[i]);
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
        if (this.timerId) {
            clearInterval(this.timerId);
        }
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

    checkAndPlayLive(videoUrl: string): void {
        this.http.get(videoUrl, { responseType: 'text' }).subscribe(data => {
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

    playLive(streamId: string): void {
        if (this.isEnterpriseEdition) {
            streamId += "_adaptive";
        }
        var srcFile = HTTP_SERVER_ROOT + this.appName + '/streams/' + streamId + '.m3u8';
        swal({
            html: '<div id="player"></div>',
            showConfirmButton: false,
            width: '600px',
            padding: 10,
            animation: false,
            showCloseButton: true,
            onOpen: () => {
                flowplayer('#player', {
                    autoplay: true,
                    clip: {
                        sources: [{
                            type: 'application/x-mpegurl',
                            src: srcFile
                        }]
                    }
                });
            },
            onClose: function () {
                flowplayer("#player").shutdown();
            }
        }).then(function () { }, function () { });
    }



    playVoD(streamName: string): void {
        // var container = document.getElementById("player");
        // install flowplayer into selected container
        var srcFile = HTTP_SERVER_ROOT + this.appName + '/streams/' + streamName;

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
                            src: srcFile
                        }]
                    }
                });
            },
            onClose: function () {
                flowplayer("#player").shutdown();
            }
        });
    }

    //file with extension
    deleteVoD(fileName: string): void {

        let VoDName = fileName.substring(0, fileName.lastIndexOf("."));
        swal({
            title: Locale.getLocaleInterface().are_you_sure,
            text: Locale.getLocaleInterface().wont_be_able_to_revert,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(() => {

            this.restService.deleteVoDFile(this.appName, VoDName).subscribe(data => {
                if (data["success"] == true) {

                }
                else {
                    this.showVoDFileNotDeleted();
                };
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
                    };
                    this.getAppLiveStreams();
                });
        });

    }

    addNewStream(): void {
        if (!this.appSettings.encoderSettings) {
            this.appSettings.encoderSettings = [];
        }
        this.appSettings.encoderSettings.push({
            height: 0,
            videoBitrate: 0,
            audioBitrate: 0
        });
    }

    deleteStream(index: number): void {
        this.appSettings.encoderSettings.splice(index, 1);
    }

    setSocialNetworkChannel(serviceName: string, type:string, value:string): void {
        this.http.post(HTTP_SERVER_ROOT + this.appName + "/rest/broadcast/setSocialNetworkChannel/"
        +serviceName+"/"+type+"/"+value, {})
        .subscribe(data => {
            console.log("set social network channel: " + data["success"]);
            if (data["success"]) {
                this.getFacebookChannel();
            }

        });
    }

    async showChannelChooserDialog(options:any, serviceName:string, type:string): Promise<boolean> {
        const {value: id} = await swal({
            title: 'Select The Page',
            input: 'select',
            inputOptions: options,
            inputPlaceholder: 'Select the Page',
            showCancelButton: true,
            inputValidator: (value) => {

                return new Promise((resolve) => {
                    if (value) {
                        console.log("selected id: " + value);

                        this.setSocialNetworkChannel(serviceName, type, value);

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
    showNetworkChannelList(serviceName:string, type:string):void {
        this.userFBPagesLoading = true;
        this.http.get(HTTP_SERVER_ROOT + this.appName + "/rest/broadcast/getSocialNetworkChannelList/"+serviceName +"/" + type, {})
            .subscribe(data => {
                console.log(data);
                var options = {
                };

                for (var i in data) {
                    options[data[i]["id"]]=data[i]["name"];
                }
                this.userFBPagesLoading = false;
                this.showChannelChooserDialog(options, serviceName, type);

            });

    }


    getFacebookChannel(): void {
        this.http.get(HTTP_SERVER_ROOT + this.appName + "/rest/broadcast/getSocialNetworkChannel/facebook", {})
        .subscribe(data => {
            console.log(data);
            this.socialMediaAuthStatus.facebookPublishChannel = new SocialNetworkChannel();
            this.socialMediaAuthStatus.facebookPublishChannel.id = data["id"];
            this.socialMediaAuthStatus.facebookPublishChannel.name = data["name"];
            this.socialMediaAuthStatus.facebookPublishChannel.type = data["type"];
        });
    }

    getSettings(): void {
        this.http.get(REST_SERVICE_ROOT + "/getSettings/" + this.appName).subscribe(data => {
            this.appSettings = <AppSettings>data;
        });

        this.http.post(HTTP_SERVER_ROOT + this.appName + "/rest/broadcast/checkDeviceAuthStatus/facebook", {})
            .subscribe(data => {
                this.socialMediaAuthStatus.isFacebookAuthenticated = data["success"];

                if (this.socialMediaAuthStatus.isFacebookAuthenticated) {
                    this.getFacebookChannel();
                }
            });

        this.http.post(HTTP_SERVER_ROOT + this.appName + "/rest/broadcast/checkDeviceAuthStatus/youtube", {})
            .subscribe(data => {
                this.socialMediaAuthStatus.isYoutubeAuthenticated = data["success"];
            });

        this.http.post(HTTP_SERVER_ROOT + this.appName + "/rest/broadcast/checkDeviceAuthStatus/periscope", {})
            .subscribe(data => {
                this.socialMediaAuthStatus.isPeriscopeAuthenticated = data["success"];
            });

    }


    changeSettings(valid: boolean): void {

        if (!valid) {
            return;
        }

        this.http.post(REST_SERVICE_ROOT + '/changeSettings/' + this.appName,
            this.appSettings
        ).subscribe(data => {
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
        });
    }

    newLiveStream(): void {
        this.newLiveStreamActive = true;
    }

    createLiveStream(isValid: boolean): void {

        if (!isValid) {
            //not valid form return directly
            return;
        }


        var socialNetworks = [];
        if (this.liveBroadcastShareFacebook == true) {
            socialNetworks.push("facebook");
        }

        if (this.liveBroadcastShareYoutube == true) {
            socialNetworks.push("youtube");
        }

        if (this.liveBroadcastSharePeriscope == true) {
            socialNetworks.push("periscope");
        }

        /*
        swal({
          html:
          '<div><button type="button" class="btn btn-simple btn-success" ><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></button>'
          +
          '</div>',
          showCancelButton:false,
          showConfirmButton:false,
        });
        */

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
                    this.getAppLiveStreams();
                    this.liveBroadcast.name = "";
                }
                //swal.close();
                this.newLiveStreamCreating = false;

            });

    }


    getParam(): void {




    }


    setGettingParametersFalse(networkName: string): void {
        switch (networkName) {
            case "facebook":
                this.gettingFacebookParameters = false;
                break;
            case "youtube":
                this.gettingYoutubeParameters = false;
                break;
            case "periscope":
                this.gettingPeriscopeParameters = false;
                break;
        }
    }

    getSocialMediaAuthParameters(networkName: string): void {

        switch (networkName) {
            case "facebook":
                this.gettingFacebookParameters = true;
                break;
            case "youtube":
                this.gettingYoutubeParameters = true;
                break;
            case "periscope":
                this.gettingPeriscopeParameters = true;
                break;
        }



        this.http.post(HTTP_SERVER_ROOT + this.appName + "/rest/broadcast/getDeviceAuthParameters/" + networkName,
            {}).subscribe(data => {
          
            if (data['verification_url']) {
                if (!data['verification_url'].startsWith("http")) {
                    data['verification_url'] = "http://" + data['verification_url'];
                }

                var message = Locale.getLocaleInterface().copy_this_code_and_enter_the_url.replace("CODE_KEY", data['user_code']);

                message = message.replace("URL_KEY", data['verification_url']); //this is for url
                message = message.replace("URL_KEY", data['verification_url']); //this is for string
                var typem = 'info';


                this.setGettingParametersFalse(networkName);
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
                    switch (networkName) {
                        case "facebook":
                            this.waitingForFacebookToBeAuthorized = true;
                            break;
                        case "youtube":
                            this.waitingForYoutubeToBeAuthorized = true;
                            break;
                        case "periscope":
                            this.waitingForPeriscopeToBeAuthorized = true;
                            break;
                    }
                    this.checkAuthStatus(networkName);

                })



            } else if (this.isEnterpriseEdition == false
                && data['message'] == "Service with the name specified is not found in this app") {

                message = Locale.getLocaleInterface().notEnterprise;

                typem = 'error';
                this.setGettingParametersFalse(networkName);
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
                });



            } else if (this.isEnterpriseEdition == true && data['message'] == "Service with the name specified is not found in this app") {

                message = Locale.getLocaleInterface().enterpriseNotActivated;;


                typem = 'error';
                this.setGettingParametersFalse(networkName);
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
                });

            }
            else if (this.isEnterpriseEdition == true && data['message'] == "Please enter service client id and client secret in app configuration") {

                message = Locale.getLocaleInterface().ketNotdefined;;


                typem = 'error';
                this.setGettingParametersFalse(networkName);
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
                });
            }
        });
    }

    cancelNewLiveStream(): void {
        this.newLiveStreamActive = false;
    }

    copyPublishUrl(streamUrl: string): void {
        this.clipBoardService.copyFromContent(this.getRtmpUrl(streamUrl), this.renderer);
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

        this.clipBoardService.copyFromContent(embedCode, this.renderer);
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
        return "rtmp://" + SERVER_ADDR + "/" + this.appName + "/" + streamUrl;
    }

    revokeSocialMediaAuth(networkName: string): void {
        this.restService.revokeSocialNetwork(this.appName, networkName)
            .subscribe(data => {
                if (data["success"] == true) {
                    if (networkName == "facebook") {
                        this.socialMediaAuthStatus.isFacebookAuthenticated = false;
                    }
                    else if (networkName == "youtube") {
                        this.socialMediaAuthStatus.isYoutubeAuthenticated = false;
                    }
                    else if (networkName == "periscope") {
                        this.socialMediaAuthStatus.isPeriscopeAuthenticated = false;
                    }
                }
            });
    }

    checkAuthStatus(networkName: string): void {
        
        this.restService.checkAuthStatus(networkName, this.appName).subscribe(data => {

            if (data["success"] != true) {
                this.checkAuthStatusTimerId = setTimeout(() => {
                    this.checkAuthStatus(networkName);
                }, 5000);
            }
            else {
                if (this.checkAuthStatusTimerId) {
                    clearInterval(this.checkAuthStatusTimerId);
                }
                if (networkName == "facebook") {
                    this.socialMediaAuthStatus.isFacebookAuthenticated = true;
                    this.gettingFacebookParameters = false;
                    this.waitingForFacebookToBeAuthorized = false;
                    this.getFacebookChannel();
                }
                else if (networkName == "youtube") {
                    this.socialMediaAuthStatus.isYoutubeAuthenticated = true;
                    this.gettingYoutubeParameters = false;
                    this.waitingForYoutubeToBeAuthorized = false;
                }
                else if (networkName == "periscope") {
                    this.socialMediaAuthStatus.isPeriscopeAuthenticated = true;
                    this.gettingPeriscopeParameters = false;
                    this.waitingForPeriscopeToBeAuthorized = false;
                }

                swal({
                    type: "success",
                    title: Locale.getLocaleInterface().congrats,
                    text: Locale.getLocaleInterface().authentication_is_done,
                });
            }
        });
    }







}
