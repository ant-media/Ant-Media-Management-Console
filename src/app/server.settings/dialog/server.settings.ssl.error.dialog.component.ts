import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

declare var $: any;

@Component({
    selector: 'server-settings-ssl-error-dialog',
    templateUrl: 'server.settings.ssl.error.dialog.component.html',
})

export class SslErrorComponent implements OnInit {

    public errorMessage:string

    constructor(
        public dialogRef: MatDialogRef<SslErrorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            this.errorMessage = data.errorMessage;
      
    }

    ngOnInit(){
        
    }


}