
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


    constructor(
        public dialogRef: MatDialogRef<BroadcastEditComponent>, public restService: RestService,
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

    updateLiveStream(isValid: boolean): void {
        if (!isValid) {
            return;
        }

        this.liveStreamEditing = new LiveBroadcast();
        this.liveStreamEditing.name = this.dialogRef.componentInstance.data.name;
        this.liveStreamEditing.streamId = this.dialogRef.componentInstance.data.streamId;


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
        this.liveStreamUpdating = true;

        this.restService.updateLiveStream(this.dialogRef.componentInstance.data.appName, this.liveStreamEditing,
            socialNetworks).subscribe(data => {
            this.liveStreamUpdating = false;
            console.log(data["success"]);
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
    }

    cancelEditLiveStream(): void {
        this.dialogRef.close();
    }

}