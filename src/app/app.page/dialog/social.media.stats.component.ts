import { Component, Inject } from '@angular/core';
import { RestService, LiveBroadcast } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    Endpoint,
    VideoServiceEndpoint,
    LiveComment,
} from '../app.definitions';
import { show403Error } from 'app/rest/rest.service';

declare var $: any;
declare var swal: any;

@Component({
    selector: 'social-media-stats-component',
    templateUrl: 'social.media.stats.component.html',
})


export class SocialMediaStatsComponent {
    loadingSettings = false;
    public appName: string;
    public streamName: string;
    public streamId: string;
    public endpointList: Endpoint[];
    public timerId: number;
    public commentCount: number[];
    public viewCount: number[];
    public likeCount: number[];
    public endpointTypes: string[];
    public tempViewCount: number[];
    public tempLikeCount: number[];
    public tempCommentCount: number[];
    public serviceCommentCount: number[];
    public comments: LiveComment[];


    constructor(
        public dialogRef: MatDialogRef<SocialMediaStatsComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.streamName = data.streamName;
        this.streamId = data.streamId;
        this.appName = data.appName;
        this.endpointList = [];
        this.commentCount = [];
        this.likeCount = [];
        this.viewCount = [];
        this.endpointTypes = [];
        this.tempViewCount = [];
        this.tempLikeCount = [];
        this.tempCommentCount = [];
        this.serviceCommentCount = [];
        this.comments = [];

        this.data.endpointList.forEach((item, index) => {
            if (item.endpointServiceId) {
                this.endpointList.push(item);
                this.serviceCommentCount[item.endpointServiceId] = 0;
                if (!this.endpointTypes.includes(item.type)) {
                    this.endpointTypes.push(item.type);
                    this.likeCount[item.type] = 0;
                    this.viewCount[item.type] = 0;
                    this.commentCount[item.type] = 0;
                }
            }
        });

        this.getStats();

        //call get comments and interaction periodically
        this.timerId = window.setInterval(() => {
             //add new comments to list and update the interaction
            this.getStats();
        }, 10000);

        //close the timer when dialog closes
        this.dialogRef.afterClosed().subscribe(result => {
            console.debug("closed dialog");
            clearInterval(this.timerId);
        });
    }

    getStats(): void {
        for (let typeName of this.endpointTypes) {
            this.tempViewCount[typeName] = 0;
            this.tempLikeCount[typeName] = 0;
            this.tempCommentCount[typeName] = 0;
        }
       
        this.restService.getBroadcast(this.appName, this.streamId).subscribe(data => {
           
            if (data["status"] != "broadcasting") {
                this.dialogRef.close();
            }
        }, error => { show403Error(error); });
        var tempViewCalled = 0;
        var tempLikeCalled = 0;
        var tempCommentCalled = 0;
        for (let element of this.endpointList) {
          
            this.restService.getLiveCommentsCount(this.appName, this.streamId, element.endpointServiceId)
                .subscribe(data => {
                    console.debug(" live comments count " + data["message"]);
                    let liveCommentCount = parseInt(data["message"]);
                    this.tempCommentCount[element.type] += liveCommentCount;
                    if (this.serviceCommentCount[element.endpointServiceId] < liveCommentCount) {
                        let batchSize = liveCommentCount - this.serviceCommentCount[element.endpointServiceId];
                        let offset = this.serviceCommentCount[element.endpointServiceId];
                        this.serviceCommentCount[element.endpointServiceId] = liveCommentCount;

                        this.restService.getLiveComments(this.appName, this.streamId, element.endpointServiceId, offset, batchSize) 
                            .subscribe(data => {
                                for (var i in data) {
                                    this.comments.push(data[i]);
                                }

                                setTimeout(() => {
                                    $("#comment-list").scrollTop($('#comment-list').prop('scrollHeight'));
                                }, 500);
                            });
                    }
                    tempCommentCalled++;
                    if (tempCommentCalled == this.endpointList.length) {
                        for (let typeName of this.endpointTypes) {
                            this.commentCount[typeName] = this.tempCommentCount[typeName];
                        }
                    }
                }, error => { show403Error(error); });

            this.restService.getLiveViewsCount(this.appName, this.streamId, element.endpointServiceId)
                .subscribe(data => {
                    console.debug("new live views count " + data["message"]);
                    this.tempViewCount[element.type] += parseInt(data["message"]);
                    tempViewCalled++;
                    if (tempViewCalled == this.endpointList.length) 
                    {    
                        for (let typeName of this.endpointTypes) {
                            this.viewCount[typeName] = this.tempViewCount[typeName];
                        }
                    }
                }, error => { show403Error(error); });

            this.restService.getInteraction(this.appName, this.streamId, element.endpointServiceId)
                .subscribe(data => {
                    if (data != null) {
                        console.debug(" like count " + data["likeCount"]);
                        this.tempLikeCount[element.type] += parseInt(data["likeCount"]) 
                                                                + parseInt(data["loveCount"]) 
                                                                + parseInt(data["hahaCount"])
                                                                + parseInt(data["wowCount"]);
                        tempLikeCalled++;
                        if (tempLikeCalled == this.endpointList.length) {
                            for (let typeName of this.endpointTypes) {
                                this.likeCount[typeName] = this.tempLikeCount[typeName];
                            }
                        }
                    }
                }, error => { show403Error(error); });
        }
    }


}