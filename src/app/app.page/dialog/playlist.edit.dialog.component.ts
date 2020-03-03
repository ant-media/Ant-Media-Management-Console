import { Component, Inject } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, LiveBroadcast } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {
    PlaylistItem,
    Playlist
} from '../app.definitions';

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
    public newPlaylistAdding = false;


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

        this.restService.getPlaylist(this.data.appName,this.data.playlistId).subscribe(data => {

            this.playlistEditing.playlistId = data["playlistId"];
            this.playlistEditing.currentPlayIndex = data["currentPlayIndex"];
            this.playlistEditing.playlistName = data["playlistName"];
            this.playlistEditing.playlistStatus = data["playlistStatus"];
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
        this.newPlaylistAdding = true;

        this.restService.updatePlaylist(this.dialogRef.componentInstance.data.appName, this.playlistEditing, this.playlistEditing.playlistId, true).subscribe(data => {

            this.playlistUpdating = false;
            this.newPlaylistAdding = false;

            if (data["success"]) {

                $.notify({
                    icon: "ti-save",
                    message: Locale.getLocaleInterface().playlist_updated
                }, {
                    type: "success",
                    delay: 900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });

                this.dialogRef.close();
                this.newPlaylistAdding = false;

            }
            else {
                $.notify({
                    icon: "ti-alert",
                    message: Locale.getLocaleInterface().playlist_not_updated + " " + data["message"] + " " + data["errorId"]
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
            streamId: "",
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