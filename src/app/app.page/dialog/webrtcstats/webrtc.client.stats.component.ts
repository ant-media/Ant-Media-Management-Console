import { Component, Inject } from '@angular/core';
import * as Chartist from 'chartist';
import * as legend from 'chartist-plugin-legend';
import { RestService, LiveBroadcast } from '../../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { WebRTCClientStat,} from '../../app.definitions';


declare var $: any;
declare var swal: any;

@Component({
    selector: 'webrct-client-stats-component',
    templateUrl: './webrtc.client.stats.component.html',
    styles: ['./webrtc.client.stats.component.css']
})

export class WebRTCClientStatsComponent {
    public appName: string;
    public streamName: string;
    public streamId: string;
    public timerId: number;
    public stats: WebRTCClientStat[];
    public bitrateChart: Chartist.Bar;
    public mediaPeriodChart: Chartist.Bar;
    
    public sss: string;
    
    constructor(
            public dialogRef: MatDialogRef<WebRTCClientStatsComponent>, public restService: RestService,
            @Inject(MAT_DIALOG_DATA) public data: any) {
        
        this.streamName = data.streamName;
        this.streamId = data.streamId;
        this.appName = data.appName;
        this.stats = [];
        
        this.getStats();
        
        
        
        
        //call get comments and interaction periodically
        this.timerId = window.setInterval(() => {
            //add new comments to list and update the interaction
            this.getStats();
        }, 2000);
        
        //close the timer when dialog closes
        this.dialogRef.afterClosed().subscribe(result => {
            console.debug("closed dialog");
            clearInterval(this.timerId);
        });
    }
    
    getStats(): void {
        this.restService.getWebRTCStats(this.appName, this.streamId).subscribe(data => {
            this.update(data);
        });
    }
    
    ngAfterViewInit() {
        var bitrateChartData = {
                series: [
                         {"name":"measured", "data":[]},
                         {"name":"send", "data":[]},
                         ]
        };
        
        var sendPeriodChartData = {
                series: [
                         {"name":"Video", "data":[]},
                         {"name":"Audio", "data":[]},
                         ]
        };
        
        var bitrateOptions = {
                seriesBarDistance: 0,
                axisX: {
                    showGrid: false
                },
                axisY: {
                    labelInterpolationFnc: function(value) {
                        return (value / 1000) + 'k';
                      }
                },
                height: "250px",
                plugins: [legend()]
        };
        
        var sendPeriodOptions = {
                seriesBarDistance: 0,
                axisX: {
                    showGrid: false
                },
                height: "250px",
                plugins: [legend()]
        };
        
        this.bitrateChart = new Chartist.Bar('#bitrateChart', bitrateChartData, bitrateOptions).on('draw', function(data) {
            if(data.type === 'bar') {
                var w = data.chartRect.width()/data.axisX.ticks.length*0.9;
                data.element.attr({
                  style: 'stroke-width: '+w+'px'
                });
              }
            });
        
        this.mediaPeriodChart = new Chartist.Bar('#mediaSendPeriodChart', sendPeriodChartData, sendPeriodOptions).on('draw', function(data) {
            if(data.type === 'bar') {
                var w = data.chartRect.width()/data.axisX.ticks.length*0.9;
                data.element.attr({
                  style: 'stroke-width: '+w+'px'
                });
              }
            });
        
        
    }
    
    update(data) {
        var measuredBitrates = [];
        var sendBitrates = [];
        var videoFrameSendPeriods = [];
        var audioFrameSendPeriods = [];
        var labels = [];
        this.stats = [];    
        
        for (var i in data) {
            
            this.stats.push(data[i]);
            measuredBitrates.push(data[i].measuredBitrate);
            sendBitrates.push(data[i].sendBitrate);
            videoFrameSendPeriods.push(data[i].videoFrameSendPeriod);
            audioFrameSendPeriods.push(data[i].audioFrameSendPeriod);
            labels.push(i);
        }
        
        var bitrateChartData = {
                labels: labels,
                series: [
                         {"name":"measured", "data":measuredBitrates},
                         {"name":"send", "data":sendBitrates},
                         ]
        };
        
        var sendPeriodChartData = {
                labels: labels,
                series: [
                         {"name":"Video", "data":videoFrameSendPeriods},
                         {"name":"Audio", "data":audioFrameSendPeriods},
                         ]
        };
        
        
        this.bitrateChart.update(bitrateChartData);
        this.mediaPeriodChart.update(sendPeriodChartData);
    }
}