import { Component, Inject } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, LiveBroadcast } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    Endpoint,
    VideoServiceEndpoint,
} from '../app.definitions';
import { show403Error } from 'app/rest/rest.service';

declare var $: any;
declare var swal: any;


@Component({
    selector: 'broadcast-edit-dialog',
    templateUrl: 'broadcast.edit.dialog.component.html',
})

export class BroadcastEditComponent {

    loading = false;
    public liveStreamUpdating = false;
    public liveStreamEditing: LiveBroadcast;
    public shareEndpoint: boolean[];
    public videoServiceEndPoints: VideoServiceEndpoint[];
    public streamNameEmpty = false;
    public endpointList: Endpoint[];
    public genericRTMPEndpointCount = 0;
    public endpoint:Endpoint;
    public streamUrlDialogValid = true;

    constructor(
        public dialogRef: MatDialogRef<BroadcastEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.shareEndpoint = [];

        this.videoServiceEndPoints = [];
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

    updateLiveStream(isValid: boolean): void {
        if (!isValid) {
            return;
        }

        this.liveStreamEditing = new LiveBroadcast();
        this.liveStreamEditing.name = this.dialogRef.componentInstance.data.name;
        this.liveStreamEditing.streamId = this.dialogRef.componentInstance.data.streamId;
        this.liveStreamEditing.webRTCViewerLimit = this.dialogRef.componentInstance.data.webRTCViewerLimit;
        this.liveStreamEditing.hlsViewerLimit = this.dialogRef.componentInstance.data.hlsViewerLimit;
        this.liveStreamEditing.dashViewerLimit = this.dialogRef.componentInstance.data.dashViewerLimit;
        this.liveStreamEditing.type = this.dialogRef.componentInstance.data.type;


        if(this.liveStreamEditing.type == "streamSource") {
            this.liveStreamEditing.ipAddr = this.dialogRef.componentInstance.data.url;
            this.liveStreamEditing.status = this.dialogRef.componentInstance.data.status;
            this.liveStreamEditing.streamUrl = this.dialogRef.componentInstance.data.streamUrl;
        }
        else if(this.liveStreamEditing.type == "ipCamera") {
            this.liveStreamEditing.ipAddr = this.dialogRef.componentInstance.data.url;
            this.liveStreamEditing.username = this.dialogRef.componentInstance.data.username;
            this.liveStreamEditing.password = this.dialogRef.componentInstance.data.pass;
            this.liveStreamEditing.status = this.dialogRef.componentInstance.data.status;
            this.liveStreamEditing.streamUrl = this.dialogRef.componentInstance.data.streamUrl;
        }

        var socialNetworks = [];
        this.shareEndpoint.forEach((value, index) => {
            if (value === true) {
                socialNetworks.push(this.videoServiceEndPoints[index].id);
            }
        });

        if (!this.restService.checkStreamName(this.liveStreamEditing.name)){

            this.streamNameEmpty = true;
            return;
        }
        if(this.liveStreamEditing.type == "streamSource") {
            if(!this.restService.checkStreamUrl(this.liveStreamEditing.streamUrl)){
                this.streamUrlDialogValid = false;
            }
        }


        this.liveStreamUpdating = true;

        this.restService.updateLiveStream(this.dialogRef.componentInstance.data.appName, this.liveStreamEditing,
            socialNetworks).subscribe(data => {
            this.liveStreamUpdating = false;

            if (data["success"]) {

                if (this.genericRTMPEndpointCount != 0) {
                    for (var i  in this.endpointList) {
                        if (this.endpointList[i].type == "generic") {
                            this.endpoint.rtmpUrl = this.endpointList[i].rtmpUrl;
                            this.restService.addRTMPEndpoint(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId, this.endpoint).subscribe(data2 => {
                                if (!data2["success"]) {
                                    data["success"] = false;
                                }
                            }, error => { show403Error(error); });
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
        }, error => { show403Error(error); });

        if(this.liveStreamEditing.type == "ipCamera") {
            setTimeout(()=>{
                this.restService.getCameraError(this.data.appName , this.data.url ) .subscribe(data => {
                    console.log("stream ID :  "+this.data.url );
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
                    this.data.url  = "";
                }, error => { show403Error(error); });

            },5000)
        }
    }



    cancelEditLiveStream(): void {
        this.dialogRef.close();
    }

}