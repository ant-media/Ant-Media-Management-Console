import {
    Component,
    Inject
} from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import {MatTableDataSource} from "@angular/material/table"
import { show403Error } from 'app/rest/rest.service';
import {HTTP_SERVER_ROOT, RestService} from '../../rest/rest.service';

export class DetectedObject {
    objectName: String;
    probability: Number;
    detectionTime: Number;
}
export class DetectedObjectTable {
    dataRows: DetectedObject[];
}

@Component({
    selector: 'detected-objects-list',
    templateUrl: 'detected.objects.list.html',
})

export class DetectedObjectListDialog {

    public detectedLenght = 100;
    public pageSize = 5;
    public pageSizeOptions = [5, 10, 20];
    public detectedListOffset = 0;

    public objectTableData: DetectedObjectTable;

    public dataSource: MatTableDataSource<DetectedObject>;

    public appName: string;

    public timerId: any;

    public displayedColumnsStreams = ['image'];

    public noDetectedObject :boolean;

    constructor(
        public dialogRef: MatDialogRef<DetectedObjectListDialog>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.dataSource = new MatTableDataSource<DetectedObject>();

        this.objectTableData = {
            dataRows: [],
        };

        this.appName = data.appName;
        this.getDetectionList(this.appName, data.streamId, this.detectedListOffset, this.pageSize);

        this.getObjectDetectedTotal(this.appName, data.streamId);

        this.dialogRef.afterClosed().subscribe(result => {
            clearInterval(this.timerId);
        })

    }

    ngOnInit() {
        this.objectTableData = {
            dataRows: []
        };

    }
    getObjectDetectedTotal(appName:string, streamId:string) {
        this.restService.getObjectDetectedTotal(appName, streamId).subscribe(data =>
        {
            this.detectedLenght = data["number"];
        }, error => { show403Error(error); });
    }

    getDetectionList(appName:string, streamId:string, offset:number, batch:number) {

        this.noDetectedObject = false;
        this.restService.getDetectionList(appName, streamId, offset, batch).subscribe(data =>
        {

            for (var i in data) {
                this.objectTableData.dataRows.push(data[i]);
            }
            this.dataSource = new MatTableDataSource(this.objectTableData.dataRows);
            console.log( " detected object number " + this.objectTableData.dataRows.length);
            if(this.objectTableData.dataRows.length ==0){
                this.noDetectedObject = true;
            }
        }, error => { show403Error(error); });

    }


    onDetectionPaginateChange(event) {

        this.detectedListOffset = event.pageIndex * event.pageSize;

        this.pageSize = event.pageSize;

        this.restService.getDetectionList(this.appName, this.data.streamId, this.detectedListOffset,  this.pageSize).subscribe(data => {

            this.objectTableData.dataRows = [];
            for (var i in data) {
                this.objectTableData.dataRows.push(data[i]);
            }

            this.dataSource = new MatTableDataSource(this.objectTableData.dataRows);
        }, error => { show403Error(error); });


    }


    onNoClick(): void {
        this.dialogRef.close();
    }

    getImageURL(imageId: string) : string {
        return HTTP_SERVER_ROOT + this.appName+'/previews/'+ imageId +'.jpeg';
    }


}