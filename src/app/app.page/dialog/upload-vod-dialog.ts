import { Component, Inject } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { show403Error } from 'app/rest/rest.service';
import { RestService } from '../../rest/rest.service';
import {Subscription} from "rxjs/Subscription";

declare var swal: any;

@Component({
    selector: 'upload-vod-dialog',
    templateUrl: 'upload-vod-dialog.html',
})

export class UploadVodDialogComponent {

    uploading = false;
    fileToUpload: File = null;
    fileselected = false;
    fileName: string;
    appName: string;
    uploadSub: Subscription;
    progress: number = 0;

    constructor(
        public dialogRef: MatDialogRef<UploadVodDialogComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    handleFileInput(files: FileList) {

        this.fileToUpload = files.item(0);
        this.fileselected = true;
        this.fileName = this.fileToUpload.name.replace(/\s/g, '_');

    }


    submitUpload() {


        if (this.fileToUpload) {

            if (this.fileToUpload.type !== 'video/mp4' && this.fileToUpload.type !== 'video/webm' && this.fileToUpload.type !== 'video/avi' && 
                    this.fileToUpload.type != 'video/quicktime') {
                swal({
                    type: "error",
                    title: "Unsupported File Type",
                    text: "MP4, WebM, AVI, MOV files are accepted!",
                    buttonsStyling: false,
                    confirmButtonClass: "btn btn-error"
                });
                
                return false;   
            }

            

            this.uploading = true;

            let formData: FormData = new FormData();

            formData.append('file', this.fileToUpload);

            formData.append('file_info', this.fileToUpload.name);

            console.log("file upload" + this.fileToUpload.name);

            if (!this.fileName || this.fileName.length == 0) {

                this.fileName = this.fileToUpload.name.substring(0, this.fileToUpload.name.lastIndexOf("."));

            }

            this.fileName = this.fileName.replace(/\s/g, '_');
            this.fileName = encodeURIComponent(this.fileName);

            this.uploadSub = this.restService.uploadVod(this.fileName, formData, this.dialogRef.componentInstance.data.appName).subscribe(data => {

                switch (data["type"]) {
                    case HttpEventType.Sent:
                        // The request was sent out over the wire.
                        this.progress = 0;
                        break;
                    case HttpEventType.UploadProgress:
                        this.progress = Math.round(data["loaded"] / data["total"] * 100);
                        break;
                    case HttpEventType.Response:
                            this.progress = 100;
                            if (data["body"]["success"] == true) {

                                this.uploading = false;

                                this.dialogRef.close();
                                swal({
                                    type: "success",
                                    title: " File is successfully uploaded!",
                                    buttonsStyling: false,
                                    confirmButtonClass: "btn btn-success"

                                });

                            } else if (data["body"]["message"] == "notMp4File") { //this error code has a wrong meaning. 

                                this.uploading = false;
                                swal({
                                    type: "error",
                                    title: "Unsupported File Type",
                                    text: "MP4, WebM, AVI, MOV files are accepted!",
                                    buttonsStyling: false,
                                    confirmButtonClass: "btn btn-error"

                                });

                            } else {
                                this.uploading = false;

                                this.dialogRef.close();
                                swal({
                                    type: "error",
                                    title: "An Error Occured!",

                                    buttonsStyling: false,
                                    confirmButtonClass: "btn btn-error"

                                });

                            }
                            break;
                        }
            }, error => { show403Error(error); });

        }


    }

    cancelUpload() {
        this.uploading = false;
        this.progress = 0;
        this.uploadSub.unsubscribe();
    }

}
