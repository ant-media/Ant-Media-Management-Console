import {Component, Inject} from '@angular/core';
import {Locale} from "../../locale/locale";
import {LiveBroadcast, RestService} from '../../rest/rest.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Endpoint, VideoServiceEndpoint,} from '../app.definitions';

declare var $: any;

@Component({
    selector: 'streamSource-edit-dialog',
    templateUrl: 'stream.source.edit.component.html',
})


export class StreamSourceEditComponent {

    public streamSource: LiveBroadcast;
    public streamUrlDialogValid = true;
    public loadingSettings = false;
    public editBroadcastShareYoutube: boolean;
    public editBroadcastShareFacebook: boolean;
    public editBroadcastSharePeriscope: boolean;
    public liveStreamEditing: LiveBroadcast;
    public shareEndpoint: boolean[];
    public videoServiceEndPoints: VideoServiceEndpoint[];
    public streamNameEmpty = false;
    public endpointList: Endpoint[];
    public genericRTMPEndpointCount = 0 ;
    public endpoint:Endpoint;


    constructor(
        public dialogRef: MatDialogRef<StreamSourceEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.shareEndpoint = [];
        this.videoServiceEndPoints = data.videoServiceEndpoints;

        this.endpointList= data.endpointList;
        this.endpoint = new Endpoint();

        // Detect How many generic Endpoint added.
        for (var i  in this.endpointList) {
            if (this.endpointList[i].type == "generic") {
                this.genericRTMPEndpointCount++;
            }
        }

        this.videoServiceEndPoints.forEach((item, index) => {
            let foundService: boolean = false;
            for (var i  in this.endpointList) {
                if (this.endpointList[i].endpointServiceId == item.id) {
                    this.shareEndpoint.push(true);
                    foundService = true;
                    break;
                }
            }
            if (foundService == false) {
                this.shareEndpoint.push(false);
            }
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }


    cancelEditLiveStream(): void {
        this.dialogRef.close();
    }

    editSettings(isValid: boolean) {

        this.streamUrlDialogValid = true;

        if (!isValid) {
            return;
        }

        this.streamSource = new LiveBroadcast();

        this.streamSource.name = this.dialogRef.componentInstance.data.name;
        this.streamSource.ipAddr = this.dialogRef.componentInstance.data.url;
        this.streamSource.username = this.dialogRef.componentInstance.data.username;
        this.streamSource.password = this.dialogRef.componentInstance.data.pass;
        this.streamSource.streamId = this.dialogRef.componentInstance.data.id;
        this.streamSource.status = this.dialogRef.componentInstance.data.status;
        this.streamSource.streamUrl=this.dialogRef.componentInstance.data.streamUrl;
        this.streamSource.type = "streamSource";

        if (!this.restService.checkStreamName(this.streamSource.name)){

            this.streamNameEmpty = true;
            return;
        }
        this.loadingSettings = true;
        
        var socialNetworks = [];
        this.shareEndpoint.forEach((value, index) => {
            if (value === true) {
                socialNetworks.push(this.videoServiceEndPoints[index].id);
            }
        });

        if(this.restService.checkStreamUrl(this.streamSource.streamUrl)){

            this.restService.updateLiveStream(this.dialogRef.componentInstance.data.appName, this.streamSource, socialNetworks).subscribe(data => {

                if (data["success"]) {

                    if (this.genericRTMPEndpointCount != 0) {
                        for (var i  in this.endpointList) {
                            if (this.endpointList[i].type == "generic") {
                                this.endpoint.rtmpUrl = this.endpointList[i].rtmpUrl;
                                this.restService.addRTMPEndpoint(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.id, this.endpoint).subscribe(data2 => {
                                    if (!data2["success"]) {
                                        data["success"] = false;
                                    }
                                });
                            }
                        }

                    }

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

                    this.dialogRef.close();

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

        } else {
            this.loadingSettings = false;
            this.streamUrlDialogValid = false;
            return;
        }
    }
}
