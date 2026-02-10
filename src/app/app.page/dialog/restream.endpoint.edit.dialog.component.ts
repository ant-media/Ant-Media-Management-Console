import {Component, Inject} from '@angular/core';
import {RestService} from '../../rest/rest.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Endpoint,} from '../app.definitions';
import { show403Error } from 'app/rest/rest.service';

declare var $: any;

@Component({
    selector: 'rtmp-endpoint-edit-dialog',
    templateUrl: 'restream.endpoint.edit.dialog.component.html',
})

export class ReStreamEndpointEditDialogComponent {

    loading = false;
    public shareEndpoint: boolean[];
    public endpointList: Endpoint[];
    public isEmptyEndpoint: boolean = true;
    public reStreamEndpointName: any;
    public endpoint: Endpoint;

    constructor(
        public dialogRef: MatDialogRef<ReStreamEndpointEditDialogComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.shareEndpoint = [];

        this.endpointList = data.endpointList;
        this.endpoint = new Endpoint();

        this.isEmptyEndpoint = true;

        // Check is null Generic endpoint list

        for (var i in this.endpointList) {

            if (this.endpointList[i].type == "generic") {
                this.isEmptyEndpoint = false;
                break;
            }
        }
    }

    addReStreamEndpoint(endpointUrl: string) {

        let resultMessage = "";

        // Check Generic Endpoint Already Added

        for (var i in this.endpointList) {
            if (this.endpointList[i].endpointUrl == endpointUrl) {
                endpointUrl = "";
                resultMessage = "URL Already added";
            }
        }
        this.endpoint.endpointUrl = endpointUrl;

        this.restService.addReStreamEndpoint(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId, this.endpoint).subscribe(data => {

            if (data["success"]) {

                resultMessage = "URL Added Successfully";

                this.reStreamEndpointName = "";

                this.endpointList = this.endpointList || [];

                this.restService.getBroadcast(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId).subscribe(data => {
                    this.endpointList = data["endPointList"];
                    for (var i in this.endpointList) {
                        if (this.endpointList[i].type == "generic") {
                            this.isEmptyEndpoint = false;
                            break;
                        }
                    }
                }, error => { show403Error(error); });

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
                resultMessage ="ReStreaming Endpoint is not be saved";
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

        }, error => { show403Error(error); });
    }

    removeReStreamEndpoint(endpoint: Endpoint, index: number) {
        //Check service Id is null
        if (endpoint.endpointServiceId != null) {
            this.restService.deleteReStreamEndpointV2(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId, endpoint.endpointServiceId).subscribe(data => {
                this.endpointDeleteProcess(endpoint,index,data);
            }, error => { show403Error(error); });
        } else {
            this.restService.deleteReStreamEndpointV1(this.dialogRef.componentInstance.data.appName, this.dialogRef.componentInstance.data.streamId, endpoint.endpointUrl).subscribe(data => {
                this.endpointDeleteProcess(endpoint,index,data);
            }, error => { show403Error(error); });
        }
    }

    cancelReStreamEndpoint(): void {
        this.dialogRef.close();
    }

    endpointDeleteProcess(endpoint: Endpoint, index: number, data:any){
        if (data["success"]) {
            this.endpointList.splice(index, 1);
            $.notify({
                icon: "ti-save",
                message: "ReStreaming Endpoint is deleted"
            }, {
                type: "success",
                delay: 900,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });
            if (this.endpointList.length == 0) {
                this.isEmptyEndpoint = true;
            } else {
                for (var i in this.endpointList) {

                    if (this.endpointList[i].type == "generic") {
                        this.isEmptyEndpoint = false;
                        break;
                    }
                    this.isEmptyEndpoint = true;
                }
            }
        } else {
            $.notify({
                icon: "ti-alert",
                message: "ReStreaming Endpoint is not deleted."
            }, {
                type: "warning",
                delay: 900,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });
        }
    }


}
