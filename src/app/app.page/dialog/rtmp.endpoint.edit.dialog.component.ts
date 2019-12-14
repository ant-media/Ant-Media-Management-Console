import { Component, Inject } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, LiveBroadcast } from '../../rest/rest.service';
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


    constructor(
        public dialogRef: MatDialogRef<RtmpEndpointEditDialogComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.shareEndpoint = [];

        this.endpointList = data.endpointList;

        this.isEmptyEndpoint = true;

            for (var i  in this.endpointList) {

                console.log("this.endpointList[i].type  " + this.endpointList[i].type);

                if (this.endpointList[i].type == "generic") {
                    this.isEmptyEndpoint = false;
                    console.log("1- this.isEmptyEndpoint  " + this.isEmptyEndpoint);
                    break;
                }
            }




    }

    addRtmpEndpoint(rtmpUrl:string){

        this.restService.addRTMPEndpoint(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId, rtmpUrl).subscribe(data => {

            if (data["success"]) {

                this.endpointList.push({
                    rtmpUrl: rtmpUrl,
                    type:"generic",
                    endpointServiceId:null,
                });

                for (var i  in this.endpointList) {

                    if (this.endpointList[i].type == "generic") {
                        this.isEmptyEndpoint = false;
                        console.log("add- this.isEmptyEndpoint  " + this.isEmptyEndpoint);
                        break;
                    }
                }

                $.notify({
                    icon: "ti-save",
                    message: "RTMP Endpoint added"
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
                    message: "RTMP Endpoint is not be saved"
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

    removeRTMPEndpoint(rtmpUrl:string,index: number){

        this.restService.removeRTMPEndpoint(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId, rtmpUrl).subscribe(data => {

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