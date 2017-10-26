import { Component, OnInit, AfterViewInit } from '@angular/core';

declare var $:any;

declare interface Table_With_Checkboxes {
    id?: number;
    name: string;
    job_position: string;
    salary: string;
    active?: boolean;
}
declare interface TableData {
    headerRow: string[];
    dataRows: string[][];
}
declare interface TableData2 {
    headerRow: string[];
    dataRows: Table_With_Checkboxes[];
}

@Component({
    moduleId: module.id,
    selector: 'extended-table-cmp',
    templateUrl: 'extendedtable.component.html'
})

export class ExtendedTableComponent implements OnInit{
    public tableData1: TableData;
    public tableData2: TableData2;
    public tableData3: TableData;
    ngOnInit(){

        this.tableData1 = {
            headerRow: [ '#', 'Name', 'Job Position', 'Since', 'Salary', 'Actions'],
            dataRows: [
                ['1', 'Andrew Mike', 'Develop', '2013', '99,225',''],
                ['2', 'John Doe', 'Design', '2012', '89,241', ''],
                ['3', 'Alex Mike', 'Design', '2010', '92,144', ''],
                ['4','Mike Monday', 'Marketing', '2013', '49,990', ''],
                ['5', 'Paul Dickens', 'Communication', '2015', '69,201', '']
            ]
        };
        this.tableData2 = {
            headerRow: [ '#', 'Name', 'Job Position', 'Salary', 'Active' ],
            dataRows: [
                {id: 1, name: 'Andrew Mike', job_position: 'Develop', salary: '99,225', active: false},
                {id: 2, name: 'John Doe', job_position: 'Design', salary: '89,241', active: false},
                {id: 3, name: 'Alex Mike', job_position: 'Design', salary: '92,144', active: true},
                {id: 4, name: 'Mike Monday', job_position: 'Marketing', salary: '49,990', active: true}
            ]
        };
        this.tableData3 = {
            headerRow: [ '', '', 'Price', 'Quantity', 'Total'],
            dataRows: [
                ['tables/agenda.png', 'Get Shit Done Notebook', 'Most beautiful agenda for the office.', '49', '1','549'],
                ['tables/stylus.jpg', 'Stylus',  'Design is not just what it looks like and feels like. Design is how it works.', '499', '2', '998'],
                ['tables/evernote.png', 'Evernote iPad Stander', 'A groundbreaking Retina display. All-flash architecture. Fourth-generation Intel processors.', '799', '1', '799']
            ]
        };
    }

    ngAfterViewInit(){
        // Init Tooltips
        $('[rel="tooltip"]').tooltip();

        $('.switch-plain').bootstrapSwitch({
            onColor:'',
            onText: '',
            offText: ''
        });
    }

    getTotal(){
        var total = 0;
        for( var i = 0; i < this.tableData3.dataRows.length; i++ ){
            var integer = parseInt(this.tableData3.dataRows[i][5])
            total += integer;
        }
        return total;
    };
}
