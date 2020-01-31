import { Component, Inject } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, LiveBroadcast } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {
    Endpoint, PlaylistItem,
    VideoServiceEndpoint,
} from '../app.definitions';
import {Playlist} from "../app.page.component";

declare var $: any;

@Component({
    selector: 'playlist-edit-dialog',
    templateUrl: 'playlist.edit.dialog.component.html',
})

export class PlaylistEditComponent {

    loading = false;
    public playlistUpdating = false;
    public playlistEditing: Playlist;
    public playlistItemEditing: PlaylistItem[];


    constructor(
        public dialogRef: MatDialogRef<PlaylistEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.playlistEditing = new Playlist();

        if (!this.playlistItemEditing) {
            this.playlistItemEditing = this.playlistItemEditing || [];
        }


        this.getPlaylistValues();

    }

    getPlaylistValues(){

        this.restService.getPlaylist(this.data.appName,"test").subscribe(data => {

            console.log("data[currentPlayIndex]->" + data["currentPlayIndex"]);
            console.log("data[playlistName]->" + data["playlistName"]);
            console.log("data[broadcastItemList]->" + data["broadcastItemList"]);

            this.playlistEditing.playlistId = data["playlistId"];
            this.playlistEditing.currentPlayIndex = data["currentPlayIndex"];
            this.playlistEditing.playlistName = data["playlistName"];
            this.playlistEditing.broadcastItemList = data["broadcastItemList"];
            this.playlistItemEditing = data["broadcastItemList"];

        });

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    updatePlaylistItemEditing(isValid: boolean): void {
        if (!isValid) {
            return;
        }


        this.playlistUpdating = true;

        this.restService.updatePlaylist(this.dialogRef.componentInstance.data.appName, this.playlistEditing, this.playlistEditing.playlistId, true).subscribe(data => {
            this.playlistUpdating = false;

            if (data["success"]) {

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

                this.dialogRef.close();

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

    addPlaylistItemEditing(): void {

        this.playlistItemEditing.push({
            name: "",
            type: "VoD",
            streamId: "streamId",
            streamUrl: "",
            hlsViewerCount: 0,
            webRTCViewerCount: 0,
            rtmpViewerCount: 0,
            mp4Enabled: 0,
        });

    }

    deletePlaylistItemEditing(index: number): void {
        this.playlistItemEditing.splice(index, 1);
    }

    cancelEditPlaylist(): void {
        this.dialogRef.close();
    }

}