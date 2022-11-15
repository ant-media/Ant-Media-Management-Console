import { Component, Inject } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, LiveBroadcast } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    PlaylistItem,
} from '../app.definitions';
import { show403Error } from 'app/rest/rest.service';

declare var $: any;

@Component({
    selector: 'playlist-edit-dialog',
    templateUrl: 'playlist.edit.dialog.component.html',
})

export class PlaylistEditComponent {

    loading = false;
    public playlistUpdating = false;
    public playlistEditing: LiveBroadcast;
    public newPlaylistAdding = false;


    constructor(
        public dialogRef: MatDialogRef<PlaylistEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.playlistEditing = new LiveBroadcast();

        this.getPlaylistValues();
    }

    getPlaylistValues(){

        this.restService.getBroadcast(this.data.appName, this.data.streamId).subscribe(data => {

            this.playlistEditing.streamId = data["streamId"];
            this.playlistEditing.playListItemList = data["playListItemList"];
            this.playlistEditing.currentPlayIndex = data["currentPlayIndex"];
            this.playlistEditing.name = data["name"];
            this.playlistEditing.playlistLoopEnabled = data["playlistLoopEnabled"];
        }, error => { show403Error(error); });

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

        this.restService.updateLiveStream(this.dialogRef.componentInstance.data.appName, this.playlistEditing, "").subscribe(data => {

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
        }, error => { show403Error(error); });
    }

    addPlaylistItemEditing(): void 
    {
        this.playlistEditing.playListItemList.push({
            type: "VoD",
            streamUrl: "",
        });
    }

    deletePlaylistItemEditing(index: number): void {
        this.playlistEditing.playListItemList.splice(index, 1);
    }

    cancelEditPlaylist(): void {
        this.dialogRef.close();
    }

}