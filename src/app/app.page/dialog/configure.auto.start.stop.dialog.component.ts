import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { RestService } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
declare var $: any;



@Component({
    selector: 'configure-auto-start-stop-dialog',
    templateUrl: 'configure.auto.start.stop.dialog.component.html',
})
export class ConfigureAutoStartStopDialogComponent {
    @ViewChild('timeElapseInput') timeElapseInput: ElementRef;


    public stream: any;
    public appName: string;
    public autoStartStopEnabled: boolean;
    public stopOnNoViewerTimeElapseSeconds: number;
    constructor(
        public dialogRef: MatDialogRef<ConfigureAutoStartStopDialogComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.appName = data.appName
        this.stream = data.stream;
        this.autoStartStopEnabled = this.stream.autoStartStopEnabled;
        this.stopOnNoViewerTimeElapseSeconds = this.stream.stopOnNoViewerTimeElapseSeconds
    }



    save() {
        var timeElapseSeconds = 0;
        console.log(this.autoStartStopEnabled)
        if (this.autoStartStopEnabled) {
            timeElapseSeconds = this.timeElapseInput.nativeElement.value
            console.log(timeElapseSeconds)

            if (timeElapseSeconds < 0) {
                alert("Time elapse cant be negative.")
                return
            }
        }

        this.restService.configureAutoStartStop(this.appName, this.stream.streamId,
            this.autoStartStopEnabled, timeElapseSeconds).subscribe(data => {
                if (data["success"] == true) {

                    $.notify({
                        icon: "ti-save",
                        message: "Success"
                    }, {
                        type: "success",
                        delay: 3000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
                } else {
                    $.notify({
                        icon: "ti-save",
                        message: "Failed. Error is " + data["message"]
                    }, {
                        type: "danger",
                        delay: 2000,
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });

                }
            })
    }

}