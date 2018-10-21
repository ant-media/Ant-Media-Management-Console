import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer,
    ViewChild
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {ClusterRestService} from '../rest/cluster.service';
import {Locale} from "../locale/locale";
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
    MatPaginatorIntl,
    MatSort,
    MatTableDataSource,
    PageEvent
} from '@angular/material';
import "rxjs/add/operator/toPromise";
import {
    ClusterInfoTable,
    ClusterNode,
    ClusterNodeInfo
} from './cluster.definitions';

declare var $: any;
declare var Chartist: any;
declare var swal: any;
declare var classie: any;

declare function require(name: string);


@Component({
  selector: 'app-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['./cluster.component.css']
})


export class ClusterComponent implements OnInit, OnDestroy, AfterViewInit {

    public nodeTableData: ClusterInfoTable;
    public timerId: any;
 
    public nodeColumns = ['nodeId', 'nodeIp', 'status', 'actions'];

    public dataSourceNode: MatTableDataSource<ClusterNodeInfo>;

    public pageSize = 5;
    public pageSizeOptions = [5, 10, 25];
    public pageIndex = 0;
    public nodeLength: any;

    // MatPaginator Output

    @Input() pageEvent: PageEvent;

    @Output()
    pageChange: EventEmitter<PageEvent>;


    // @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    constructor(private http: HttpClient, 
    			private route: ActivatedRoute,
                private clusterRestService: ClusterRestService,
                private renderer: Renderer,
                public router: Router,
                public dialog: MatDialog,
                private cdr: ChangeDetectorRef,
                private matpage: MatPaginatorIntl,
    ) {
        this.dataSourceNode = new MatTableDataSource<ClusterNodeInfo>();

    }

    setPageSizeOptions(setPageSizeOptionsInput: string) {
        this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }

    ngOnInit() {

        var self = this;

       this.nodeTableData = {
            dataRows: []
        };
    }

    onPaginateChange(event) {
        console.log("page index:" + event.pageIndex);
        console.log("length:" + event.length);
        console.log("page size:" + event.pageSize);

        this.pageIndex = event.pageIndex;
        this.updateTable();
    }

    ngAfterViewInit() {

        setTimeout(() => {
            this.getClusterNodes(); 
        }, 500);

		this.timerId = window.setInterval(() => {
        	this.getClusterNodes();
        }, 10000);
    }

    ngOnDestroy() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    updateTable()
    {
    	var start = this.pageIndex * this.pageSize;
    	var end = start + this.pageSize; 
    	this.dataSourceNode = new MatTableDataSource(this.nodeTableData.dataRows.slice(start, end));
    }
   
    getClusterNodes(): void {
        this.clusterRestService.getClusterNodes().subscribe(data => {
            this.nodeTableData.dataRows = [];
            for (var i in data) {
                this.nodeTableData.dataRows.push(data[i]);
            }
        	this.nodeLength = this.nodeTableData.dataRows.length;
        	this.updateTable();
        });
		console.log('deneme:'+this.nodeTableData);
    }

    openNodeEditDialog(nodeId: string): void {
    	let node = this.nodeTableData.dataRows.find(n => n.id == nodeId);


     	let dialogRef = this.dialog.open(EditNodeComponent, {
            data: { 
            	node: node,
             },
            width: '300px'

        });


        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.getClusterNodes();
        });   
    }

    openNodeCreateDialog(): void {
    	
     	let dialogRef = this.dialog.open(CreateNodeComponent, {
            data: { 
            	
             },
            width: '300px'

        });


        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.getClusterNodes();
        });   
    }


    deleteNode(nodeId: string): void {


        swal({
            title: Locale.getLocaleInterface().are_you_sure,
            text: Locale.getLocaleInterface().wont_be_able_to_revert,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(() => {
		
    		let node = this.nodeTableData.dataRows.find(n => n.id == nodeId);

            this.clusterRestService.deleteClusterNodes(node).subscribe(data => {
                if (data["success"] == true) {

                }
                else {
                    this.showNodeNotDeleted();
                };
                this.getClusterNodes();
            });

        }).catch(function () {

        });
  
    }

    showNodeNotDeleted() {
        
    	$.notify({
            icon: "ti-save",
            message: "Node can not be deleted."
        }, {
            type: "warning",
            delay: 900,
            placement: {
                from: 'top',
                align: 'right'
            }
        });
    }
}




@Component({
    selector: 'edit-node-dialog',
    templateUrl: 'edit-node-dialog.html',
})


export class EditNodeComponent {


	public node : ClusterNodeInfo;
	public progressing = false;

    constructor(
        public dialogRef: MatDialogRef<EditNodeComponent>, 
        public clusterRestService: ClusterRestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

    	this.node = data.node;

    }

    cancel(): void {
        this.dialogRef.close();
    }


    updateNode() {

    		this.progressing = true;
    		
            this.clusterRestService.updateClusterNodes(this.node).subscribe(data => {

                if (data["success"] == true) {

                    this.progressing = false;

                    this.dialogRef.close();
                    swal({
                        type: "success",
                        title: " Node is successfully updated!",
                        buttonsStyling: false,
                        confirmButtonClass: "btn btn-success"

                    });

                } 
                 else {
                    this.progressing = false;

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



@Component({
    selector: 'create-node-dialog',
    templateUrl: 'create-node-dialog.html',
})


export class CreateNodeComponent {


	public node : ClusterNodeInfo;
	public progressing = false;

    constructor(
        public dialogRef: MatDialogRef<CreateNodeComponent>, 
        public clusterRestService: ClusterRestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    	
    	this.node = {id:'', ip:'', status: ''};
    }

    cancel(): void {
        this.dialogRef.close();
    }


        createNode() {

    		this.progressing = true;
    		
            this.clusterRestService.addClusterNodes(this.node).subscribe(data => {

                if (data["success"] == true) {

                    this.progressing = false;

                    this.dialogRef.close();
                    swal({
                        type: "success",
                        title: " Node is successfully added!",
                        buttonsStyling: false,
                        confirmButtonClass: "btn btn-success"

                    });

                } 
                 else {
                    this.progressing = false;

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


