import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RestService } from '../../../rest/rest.service';

declare var swal: any;

@Component({
    selector: 'upload-war-file-dialog',
    templateUrl: 'upload-war-file-dialog.html',
})

export class UploadWarFileDialogComponent {

    uploading = false;
    fileToUpload: File = null;
    fileselected = false;
    fileName: string;
    appName: string;

    constructor(
        public dialogRef: MatDialogRef<UploadWarFileDialogComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    handleFileInput(files: FileList) {

        this.fileToUpload = files.item(0);
        this.fileselected = true;
        this.fileName = this.fileToUpload.name.replace(/\s/g, '_');
        console.log(this.fileName);

    }


    submitUpload() {


        if (this.fileToUpload) {
            this.uploading = true;

            let formData: FormData = new FormData();

            formData.append('file', this.fileToUpload);

            formData.append('file_info', this.fileToUpload.name);

            console.log("file upload" + this.fileToUpload.name);

            if (!this.fileName || this.fileName.length == 0) {

                this.fileName = this.fileToUpload.name.substring(0, this.fileToUpload.name.lastIndexOf("."));
                ;
            }

            this.fileName = this.fileName.replace(/\s/g, '_');

            let appName =this.fileName.substring(0, this.fileToUpload.name.lastIndexOf(".")); 

            console.log("*********** = " + this.fileName)

            this.restService.uploadWarFile(appName,this.fileName, formData).subscribe(data => {

                if (data["success"] == true) {

                    this.uploading = false;

                    this.dialogRef.close();
                    swal({
                        type: "success",
                        title: " File is successfully uploaded!",
                        buttonsStyling: false,
                        confirmButtonClass: "btn btn-success"

                    });

                } else if (data["message"] == "notMp4File") {

                    this.uploading = false;
                    swal({
                        type: "error",
                        title: "Only Mp4 files are accepted!",

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

            });

        }


    }

}