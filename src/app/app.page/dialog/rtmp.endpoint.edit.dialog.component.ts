import { Component, Inject } from '@angular/core';
import { RestService } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {
    Endpoint,
} from '../app.definitions';

declare var $: any;

@Component({
    selector: 'rtmp-endpoint-edit-dialog',
    templateUrl: 'rtmp.endpoint.edit.dialog.component.html',
})

export class RtmpEndpointEditDialogComponent {

    loading = false;
    public shareEndpoint: boolean[];
    public endpointList: Endpoint[];
    public isEmptyEndpoint: boolean = true;
    public rtmpEndpointName: any;
    public endpoint: Endpoint;

    constructor(
        public dialogRef: MatDialogRef<RtmpEndpointEditDialogComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.shareEndpoint = [];

        this.endpointList = data.endpointList;
        this.endpoint = new Endpoint();

        this.isEmptyEndpoint = true;

        // Check is null Generic endpoint list

        for (var i  in this.endpointList) {

            if (this.endpointList[i].type == "generic") {
                this.isEmptyEndpoint = false;
                break;
            }
        }
    }

    addRtmpEndpoint(rtmpUrl:string){

        let resultMessage = "";

        // Check Generic Endpoint Already Added

        for (var i  in this.endpointList){
            if (this.endpointList[i].rtmpUrl == rtmpUrl) {
                rtmpUrl = "";
                resultMessage = "RTMP URL Already added";
            }
        }
        this.endpoint.rtmpUrl = rtmpUrl;

        this.restService.addRTMPEndpoint(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId, this.endpoint).subscribe(data => {

            if (data["success"]) {

                resultMessage = "RTMP URL Added Successfully";

                this.rtmpEndpointName = "";

                this.endpointList = this.endpointList || [];

                this.restService.getBroadcast(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId).subscribe(data => {
                    this.endpointList = data["endPointList"];
                    for (var i  in this.endpointList) {
                        if (this.endpointList[i].type == "generic") {
                            this.isEmptyEndpoint = false;
                            break;
                        }
                    }
                });

                $.notify({
                    icon: "ti-save",
                    message: resultMessage,
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
                resultMessage ="RTMP Endpoint is not be saved";
                $.notify({
                    icon: "ti-alert",
                    message: resultMessage
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

    removeRTMPEndpoint(endpointServiceId:string,index: number){

        this.restService.deleteRTMPEndpoint(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId, endpointServiceId).subscribe(data => {

            if (data["success"]) {

                this.endpointList.splice(index, 1);

                $.notify({
                    icon: "ti-save",
                    message: "RTMP Endpoint is deleted"
                }, {
                    type: "success",
                    delay: 900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });

                if(this.endpointList.length == 0){
                    this.isEmptyEndpoint = true;
                }

                else{

                    for (var i  in this.endpointList) {

                        if (this.endpointList[i].type == "generic") {
                            this.isEmptyEndpoint = false;
                            break;
                    }
                    this.isEmptyEndpoint = true;
                    }
                }

            }
            else {
                $.notify({
                    icon: "ti-alert",
                    message: "RTMP Endpoint is not deleted."
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

    cancelRTMPEndpoint(): void {
        this.dialogRef.close();
    }

}