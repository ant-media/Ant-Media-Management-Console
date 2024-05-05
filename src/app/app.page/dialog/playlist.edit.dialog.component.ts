import { Component, Inject , AfterViewInit} from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, LiveBroadcast, HTTP_SERVER_ROOT } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    PlaylistItem,
    VodInfo,
    VodInfoTable,
} from '../app.definitions';
import { MatTableDataSource } from "@angular/material/table"
import { show403Error } from 'app/rest/rest.service';
import { SelectionModel } from "@angular/cdk/collections";


declare var $: any;
declare var swal: any;

@Component({
    selector: 'playlist-edit-dialog',
    templateUrl: 'playlist.edit.dialog.component.html',
})

export class PlaylistEditComponent implements AfterViewInit{

    loading = false;
    public playlistUpdating = false;
    public playlistEditing: LiveBroadcast;
    public newPlaylistAdding = false;

    public directUrlAdding = false;
    public vodAdding = false;

    scheduleToStart = false;

    public playListItemAdding:PlaylistItem;
    public playListItemEditing:PlaylistItem;
    public playlistItemAddingActive:boolean
    public filterValue:string;

    timeFormatValidity: { [index: number]: boolean } = {};

    public vodTableDataForPlaylist: VodInfoTable;

    public dataSourceVod: MatTableDataSource<VodInfo>;

    public displayedColumnsStreams = ['select', 'name'];

    public selectionStreams = new SelectionModel<string>(true, []);

    public editItemIndex = -1;

    public playlistItemUpdating:boolean;


    ngAfterViewInit() {

        this.getPlaylistValues();

    }
    allTimeFormatsAreValid(): boolean {
        // Assuming timeFormatValidity is an object where keys are indices and values are boolean validity flags
        return Object.values(this.timeFormatValidity).every(isValid => isValid !== false);
    }

    constructor(
        public dialogRef: MatDialogRef<PlaylistEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.playlistEditing = new LiveBroadcast();
        this.filterValue = "";

        this.vodTableDataForPlaylist = {
            dataRows: []
        };
        this.dataSourceVod = new MatTableDataSource<VodInfo>();


    }

    scheduleToStartChanged(value) {
        console.log("scheduleToStartChanged " , value);

        if (this.scheduleToStart) {
            $('.datetimepicker').show();
        } 
        else {
            $('.datetimepicker').hide();
        }
        
    }

    getPlaylistValues(){

        this.restService.getBroadcast(this.data.appName, this.data.streamId).subscribe(data => {

            this.playlistEditing.streamId = data["streamId"];
            this.playlistEditing.playListItemList = data["playListItemList"];
            this.playlistEditing.currentPlayIndex = data["currentPlayIndex"];
            this.playlistEditing.name = data["name"];
            this.playlistEditing.playlistLoopEnabled = data["playlistLoopEnabled"];
            this.playlistEditing.plannedStartDate = data["plannedStartDate"];
            this.playlistEditing.type = data["type"];
            if (this.playlistEditing.plannedStartDate != 0) {
                this.scheduleToStart = true;
            }

            $('.datetimepicker').datetimepicker({
                icons: {
                    time: "fa fa-clock-o",
                    date: "fa fa-calendar",
                    up: "fa fa-chevron-up",
                    down: "fa fa-chevron-down",
                    previous: 'fa fa-chevron-left',
                    next: 'fa fa-chevron-right',
                    today: 'fa fa-screenshot',
                    clear: 'fa fa-trash',
                    close: 'fa fa-remove'
                },
                format: "MMM DD YYYY hh:mm A",
                date:this.playlistEditing.plannedStartDate != 0 ? (new Date(this.playlistEditing.plannedStartDate * 1000)) : ""
            });

            if (!this.scheduleToStart) {
               $('.datetimepicker').hide();
            }
        
        }, error => { show403Error(error); });

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    // Convert HH:MM:SS to milliseconds
    convertToMilliseconds(time) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return ((hours * 60 + minutes) * 60 + seconds) * 1000;
    }

    seekTimeChanged(newValue, index) {
        var value = this.convertToMilliseconds(newValue);
        if (!isNaN(value)) {
            this.playListItemEditing.seekTimeInMs = value;
            this.timeFormatValidity[index] = true;
        }
        else {
            this.timeFormatValidity[index] = false;
        }
    }

    isTimeFormatCorrect(index: number): boolean {
        // Undefined means not yet checked, which we treat as valid until checked
        return this.timeFormatValidity[index] !== false;
      }

    getStartTime(index) {
        //if (this.playlistEditing.playListItemList[i].durationInMs != 0) 
        {
            let length =  this.playlistEditing.playListItemList.length;
            var startTime = 0;
            for (var i = 0; i < index; i++) {
                startTime += this.playlistEditing.playListItemList[i].durationInMs - this.playlistEditing.playListItemList[i].seekTimeInMs;
            } 
            return this.getFormattedTime(startTime);
        }
      //  else {
        //    return "N/A";
        //}
    }
      
    // Convert milliseconds to HH:MM:SS
    getFormattedTime(milliseconds) {
        if (milliseconds && Number(milliseconds) > 0) {
            let seconds = Math.floor(milliseconds / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            seconds = seconds % 60;
            minutes = minutes % 60;
            // Formatting to HH:MM:SS
            return [hours, minutes, seconds].map(val => val.toString().padStart(2, '0')).join(':');
        }
        else {
            return "00:00:00";
        }
    }

    getPlayListDuration(): string {

        var totalDurationInMs = 0;
        this.playlistEditing.playListItemList.forEach((item) => {
            totalDurationInMs += item.durationInMs - item.seekTimeInMs;
        });
        return this.getFormattedTime(totalDurationInMs);
    }
    

    updatePlaylistItemEditing(isValid: boolean): void {

        
        if (!isValid) {
            return;
        }
        if (!this.allTimeFormatsAreValid()) {
            console.log('Prevented form submission due to invalid time format.');
            return;
        }
        this.playlistUpdating = true;
        this.newPlaylistAdding = true;
        if (this.scheduleToStart && $('.datetimepicker').val() != "") {
            this.playlistEditing.plannedStartDate = new Date($('.datetimepicker').data("DateTimePicker").viewDate()).getTime()/1000;
        }
        else {
            this.playlistEditing.plannedStartDate = 0;
        }
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

    /*
    addPlaylistItemEditing(): void 
    {
        this.playlistEditing.playListItemList.push({
            type: "VoD",
            streamUrl: "",
            seekTimeInMs:0,
            durationInMs:0,
            name: ""
        });
    }
    */

    deletePlaylistItemEditing(index: number): void {
        this.playlistEditing.playListItemList.splice(index, 1);
    }

    cancelEditPlaylist(): void {
        this.dialogRef.close();
    }

    addPlaylistItemDirectly() {
        this.directUrlAdding = true;
        this.vodAdding = false;
        this.playListItemAdding = new PlaylistItem();

    }

    addPlaylistItemDirectlyClicked() {
        this.playlistItemAddingActive = true;

        this.restService.getDurationInMilliseconds(this.data.appName,this.playListItemAdding.streamUrl).subscribe(data => {

            this.playlistItemAddingActive = false;
            if (data["success"]) {
                this.playlistEditing.playListItemList.push({
                    type:"VoD",
                    streamUrl: this.playListItemAdding.streamUrl,
                    name: this.playListItemAdding.name,
                    seekTimeInMs:0,
                    durationInMs: Number(data["dataId"])
        
                });
                this.directUrlAdding = false;
            }
            else {
                if (data["errorId"] == -1) 
                {
                    //duration cannot be found, it may happen
                    this.playlistEditing.playListItemList.push({
                        type:"VoD",
                        streamUrl: this.playListItemAdding.streamUrl,
                        name: this.playListItemAdding.name,
                        seekTimeInMs:0,
                        durationInMs: Number(data["dataId"])
            
                    });
                }
                else {
                    if (data["errorId"] == -2) {
                        swal({
                            title: "Warning",
                            text: "URL cannot be accessible",
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        })
                    }
                    else {
                        swal({
                            title: "Warning",
                            text: "Stream format cannot be found in this url",
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        })
                    }
                }

            }
        }, error => {
            this.playlistItemAddingActive = false;
            this.directUrlAdding = false;
        });

       

       
    }

    addPlaylistItemFromVoDs() {
        this.directUrlAdding = false;
        this.vodAdding = true;
        this.playListItemAdding = new PlaylistItem();

    }

    applyFilter(filterValue: string) {

        if (this.filterValue != filterValue && filterValue.length>3) {
            this.filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
            console.log("applyfilter: " + filterValue);

            
            this.restService.getVodList(this.data.appName, 0, 20, "", "", this.filterValue).subscribe(data => {
                this.vodTableDataForPlaylist.dataRows = [];
                for (var i in data) {
                    this.vodTableDataForPlaylist.dataRows.push(data[i]);
                    console.log(data[i]);
                }
                this.dataSourceVod = new MatTableDataSource(this.vodTableDataForPlaylist.dataRows);
            }, error => { show403Error(error); });
            

        }
    }

    addPlaylistItemFromVoDsClicked() {
        if (this.selectionStreams.isEmpty()) {

            swal({
                title: "Warning",
                text: "Please Select VoD to Add the Playlist",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            })
            return;
        }

        for (let i of Object.keys(this.dataSourceVod.data)) {

            if (this.selectionStreams.isSelected(this.dataSourceVod.data[i].vodId)) {

                var url = HTTP_SERVER_ROOT + this.data.appName + "/" + this.dataSourceVod.data[i].filePath;
                this.playlistEditing.playListItemList.push({
                    type: "VoD",
                    streamUrl: url,
                    name: this.dataSourceVod.data[i].vodName,
                    seekTimeInMs:0,
                    durationInMs:this.dataSourceVod.data[i].duration
                });

                
            }
        }

        this.vodAdding = false;
        this.selectionStreams.clear();
        this.vodTableDataForPlaylist.dataRows = [];
        this.dataSourceVod = new MatTableDataSource(this.vodTableDataForPlaylist.dataRows);
    
    }

    selectHandlerStreams(vodId: string) {
        this.selectionStreams.toggle(vodId);
    }

    cancelAddingPlayListItem() {
        this.directUrlAdding = false;
        this.vodAdding = false;
        this.vodTableDataForPlaylist.dataRows = [];
        this.dataSourceVod = new MatTableDataSource(this.vodTableDataForPlaylist.dataRows);
    }

    editPlayListItem(index:number) {
        this.playListItemEditing = new PlaylistItem();
        this.playListItemEditing.name = this.playlistEditing.playListItemList[index].name;
        this.playListItemEditing.streamUrl = this.playlistEditing.playListItemList[index].streamUrl;
        this.playListItemEditing.seekTimeInMs = this.playlistEditing.playListItemList[index].seekTimeInMs;
        this.playListItemEditing.durationInMs = this.playlistEditing.playListItemList[index].durationInMs;
        this.playListItemEditing.type = this.playlistEditing.playListItemList[index].type;


        this.editItemIndex = index;
    }
    updateEditPlaylistItem() {

        this.playlistItemUpdating = true;
        this.restService.getDurationInMilliseconds(this.data.appName,this.playListItemEditing.streamUrl).subscribe(data => {
            this.playlistItemUpdating = false;
            if (data["success"]) {
                this.playlistEditing.playListItemList[ this.editItemIndex ].name = this.playListItemEditing.name;
                this.playlistEditing.playListItemList[ this.editItemIndex ].streamUrl =  this.playListItemEditing.streamUrl;
                this.playlistEditing.playListItemList[ this.editItemIndex ].seekTimeInMs = this.playListItemEditing.seekTimeInMs;
        
                this.playlistEditing.playListItemList[ this.editItemIndex ].durationInMs = this.playListItemEditing.durationInMs;
        
                this.playlistEditing.playListItemList[ this.editItemIndex ].type =  this.playListItemEditing.type;
                this.editItemIndex = -1;
            }
            else {
                if (data["errorId"] == -1) 
                {
                    //duration cannot be found, it may happen
                    this.playlistEditing.playListItemList[ this.editItemIndex ].name = this.playListItemEditing.name;
                    this.playlistEditing.playListItemList[ this.editItemIndex ].streamUrl =  this.playListItemEditing.streamUrl;
                    this.playlistEditing.playListItemList[ this.editItemIndex ].seekTimeInMs = this.playListItemEditing.seekTimeInMs;
            
                    this.playlistEditing.playListItemList[ this.editItemIndex ].durationInMs = this.playListItemEditing.durationInMs;
            
                    this.playlistEditing.playListItemList[ this.editItemIndex ].type =  this.playListItemEditing.type;
                    this.editItemIndex = -1;
                }
                else {
                    if (data["errorId"] == -2) {
                        swal({
                            title: "Warning",
                            text: "URL cannot be accessible",
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        })
                    }
                    else {
                        swal({
                            title: "Warning",
                            text: "Stream format cannot be found in this url",
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        })
                    }
                }

            }
        }, error => {
            this.playlistItemUpdating = false;
        });


       
        
    }

    cancelEditPlaylistItem() {
        this.editItemIndex = -1;
    }

}