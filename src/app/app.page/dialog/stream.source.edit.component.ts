
import { Component, Inject } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, LiveBroadcast } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {
    Endpoint,
    VideoServiceEndpoint,
} from '../app.definitions';

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


    constructor(
        public dialogRef: MatDialogRef<StreamSourceEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.shareEndpoint = [];
        this.videoServiceEndPoints = data.videoServiceEndpoints;

        let endpointList: Endpoint[] = data.endpointList;
        this.videoServiceEndPoints.forEach((item, index) => {
            let foundService: boolean = false;
            for (var i  in endpointList) {
                if (endpointList[i].endpointServiceId == item.id) {
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

        console.log(this.dialogRef.componentInstance.data.status + this.dialogRef.componentInstance.data.id + this.dialogRef.componentInstance.data.name + this.dialogRef.componentInstance.data.url + this.dialogRef.componentInstance.data.username);


        this.streamSource = new LiveBroadcast();

        this.streamSource.name = this.dialogRef.componentInstance.data.name;
        this.streamSource.ipAddr = this.dialogRef.componentInstance.data.url;
        this.streamSource.username = this.dialogRef.componentInstance.data.username;
        this.streamSource.password = this.dialogRef.componentInstance.data.pass;
        this.streamSource.streamId = this.dialogRef.componentInstance.data.id;
        this.streamSource.status = this.dialogRef.componentInstance.data.status;
        this.streamSource.streamUrl=this.dialogRef.componentInstance.data.streamUrl;

        
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

            this.restService.editCameraInfo(this.streamSource, this.dialogRef.componentInstance.data.appName, socialNetworks).subscribe(data => {

                if (data["success"]) {

                    this.dialogRef.close();

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

        } else {
            this.loadingSettings = false;
            this.streamUrlDialogValid = false;
            return;
        }
    }
}
