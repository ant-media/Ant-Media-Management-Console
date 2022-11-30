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
    Renderer2,
    ViewChild
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {ClusterRestService} from '../rest/cluster.service';
import {Locale} from "../locale/locale";
import {MatDialog} from '@angular/material/dialog';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {PageEvent} from '@angular/material/paginator';
import "rxjs/add/operator/toPromise";
import {
    ClusterInfoTable,
    ClusterNode,
    ClusterNodeInfo
} from './cluster.definitions';
import { show403Error } from 'app/rest/rest.service';

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
 
    public nodeColumns = ['nodeIp', 'cpu', 'memory', 'lastUpdateTime', 'inTheCluster', 'actions'];

    public dataSourceNode: MatTableDataSource<ClusterNodeInfo>;

    public pageSize = 10;
    public pageSizeOptions = [10, 25, 50];
    public pageIndex = 0;
    public nodeLength: any;


    public currentOffset = 0;

    @Input() pageEvent: PageEvent;

    @Output()
    pageChange: EventEmitter<PageEvent>;


    // @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    constructor(private http: HttpClient, 
    			private route: ActivatedRoute,
                private clusterRestService: ClusterRestService,
                private renderer: Renderer2,
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

       this.nodeTableData = {
            dataRows: []
        };
    }

    onPaginateChange(event) {
        console.log("cluster page index:" + event.pageIndex + " length: " + event.length + " pageSize:" + event.pageSize);

        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.currentOffset = event.pageIndex * this.pageSize;

        this.getClusterNodes(this.currentOffset, this.pageSize);
    }


    ngAfterViewInit() 
    {
        this.getClusterNodeCount();
        this.getClusterNodes(0, this.pageSize); 
       
		this.timerId = window.setInterval(() => {
            this.getClusterNodeCount();
        	this.getClusterNodes(this.currentOffset, this.pageSize);
        }, 10000);
    }

    ngOnDestroy() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    getClusterNodeCount() {
        this.clusterRestService.getClusterNodeCount().subscribe( data => {
            this.nodeLength = data["number"];
        }, error => { show403Error(error); });
    }
   
    getClusterNodes(offset: number, size:number): void {
        this.clusterRestService.getClusterNodes(offset, size).subscribe(data => {
            this.nodeTableData.dataRows = [];
            for (var i in data) {
                this.nodeTableData.dataRows.push(data[i]);
            }
        	
            this.dataSourceNode = new MatTableDataSource(this.nodeTableData.dataRows);
        }, error => { show403Error(error); });
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
                this.getClusterNodes(this.currentOffset, this.pageSize);
            }, error => { show403Error(error); });

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




