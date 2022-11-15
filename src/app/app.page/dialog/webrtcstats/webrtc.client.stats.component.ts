import {Component, Inject} from '@angular/core';
import * as Chartist from 'chartist';
import * as legend from 'chartist-plugin-legend';
import {RestService} from '../../../rest/rest.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {WebRTCClientStat,} from '../../app.definitions';
import { show403Error } from 'app/rest/rest.service';


declare var $: any;
declare var swal: any;

@Component({
    selector: 'webrct-client-stats-component',
    templateUrl: './webrtc.client.stats.component.html',
    styleUrls: ['./webrtc.client.stats.component.css']
})

export class WebRTCClientStatsComponent {
    public appName: string;
    public streamName: string;
    public streamId: string;
    public timerId: number;
    public stats: WebRTCClientStat[];
    public bitrateChart: any;
    public mediaPeriodChart: any;

    public webrtcLenght = 0;
    public pageSize = 5;
    public pageSizeOptions = [10, 25, 50];
    public webrtcListOffset = 0;

    public sss: string;

    constructor(
        public dialogRef: MatDialogRef<WebRTCClientStatsComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.streamName = data.streamName;
        this.streamId = data.streamId;
        this.appName = data.appName;
        this.stats = [];

        this.getWebRTCStatsTotal(this.appName, this.streamId);

        this.getStats();


        //call get comments and interaction periodically
        this.timerId = window.setInterval(() => {
            //add new comments to list and update the interaction
            this.getStats();
            this.getWebRTCStatsTotal(this.appName, this.streamId);
        }, 2000);

        //close the timer when dialog closes
        this.dialogRef.afterClosed().subscribe(result => {
            console.debug("closed dialog");
            clearInterval(this.timerId);
        });
    }

    getStats(): void {
        this.restService.getWebRTCStatsList(this.appName, this.streamId, this.webrtcListOffset, this.pageSize).subscribe(data => {
            this.update(data);
        }, error => { show403Error(error); });
    }

    getWebRTCStatsTotal(appName:string, streamId:string) {
        this.restService.getStats(appName, streamId).subscribe(data =>
        {
            this.webrtcLenght = data["totalWebRTCWatchersCount"];   
        }, error => { show403Error(error); });
    }



    onWebRtcPaginateChange(event) {

        this.webrtcListOffset = event.pageIndex * event.pageSize;

        this.pageSize = event.pageSize;

        this.restService.getWebRTCStatsList(this.appName, this.data.streamId, this.webrtcListOffset,  this.pageSize).subscribe(data => {

            this.update(data);

        }, error => { show403Error(error); });


    }

    ngAfterViewInit() {
        var bitrateChartData = {
            series: [
                {"name": "measured", "data": []},
                {"name": "send", "data": []},
            ]
        };

        var sendPeriodChartData = {
            series: [
                {"name": "Video", "data": []},
                {"name": "Audio", "data": []},
            ]
        };
        var bitrateOptions = {

            axisY: {
                labelInterpolationFnc: function (value) {
                    return (value / 1000) + 'k';
                }
            },

            axisX: {
                labelInterpolationFnc: function (value) {
                    return 'Client ' + value;
                }
            },


            height: "250px",
            plugins: [legend()]
        };

        var sendPeriodOptions = {

            low: 0,
            axisX: {
                labelInterpolationFnc: function (value) {
                    return 'Client ' + value;
                }
            },

            height: "250px",
            plugins: [legend()]
        };
        this.bitrateChart = new Chartist.Bar('#bitrateChart', bitrateChartData, bitrateOptions);

        this.mediaPeriodChart = new Chartist.Line('#mediaSendPeriodChart', sendPeriodChartData, sendPeriodOptions);
    }

    update(data) {
        var measuredBitrates = [];
        var sendBitrates = [];
        var videoFrameSendPeriods = [];
        var audioFrameSendPeriods = [];
        var labels = [];
        this.stats = [];
        var label:number;
        label = 1;

        for (var i in data) {


            this.stats.push(data[i]);
            measuredBitrates.push(data[i].measuredBitrate);
            sendBitrates.push(data[i].sendBitrate);
            videoFrameSendPeriods.push(data[i].videoFrameSendPeriod);
            audioFrameSendPeriods.push(data[i].audioFrameSendPeriod);

            labels.push(label);
            label++
        }

        var bitrateChartData = {
            labels: labels,
            series: [
                {"name": "measured", "data": measuredBitrates},
                {"name": "send", "data": sendBitrates},
            ]
        };

        var sendPeriodChartData = {
            labels: labels,
            series: [
                {"name": "Video", "data": videoFrameSendPeriods},
                {"name": "Audio", "data": audioFrameSendPeriods},
            ]
        };


        this.bitrateChart.update(bitrateChartData);
        this.mediaPeriodChart.update(sendPeriodChartData);
    }
}