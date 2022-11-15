import { Component, Inject, OnInit } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, User,show403Error } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ServerSettingsComponent} from "..//server.settings.component";
import {MD5} from "../../rest/auth.service";

declare var $: any;
declare var swal: any;


@Component({
    selector: 'user-edit-dialog',
    templateUrl: 'user.edit.dialog.component.html',
})

export class UserEditComponent implements OnInit {

    loading = false;
    public userUpdating = false;
    public userEditing: User;
    public userNameEmpty = false;
    public allowedApp : string;
    public changePassword = false;
    public newPasswordAgain = "";

    //TODO: duplicate variables
    public AdminUserType : string = "ADMIN";
    public ReadOnlyUserType : string = "READ_ONLY";
    public BasicUserType : string = "USER";
    public SYSTEM_SCOPE_OF_ACCESS : string = "system";
	public applications : any;

    constructor(
        public dialogRef: MatDialogRef<UserEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            console.debug(data.email + " - " + data.type)
            this.userEditing = new User(data.email,"");
            this.userEditing.scope = data.scope;
            this.userEditing.userType = data.type;
    }

    ngOnInit(){
        this.restService.getApplications().subscribe(data => {
            this.applications = data;
        }, error => { show403Error(error); });

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    updateUser(isValid: boolean): void {
        if (!isValid) {
            return;
        }

        if (!this.restService.checkStreamName(this.userEditing.email)){
            this.userNameEmpty = true;
            return;
        }
        console.log("user pass word " + this.userEditing.newPassword);
        if (this.userEditing.newPassword != "" && this.userEditing.newPassword != undefined) {
            this.userEditing.newPassword = MD5(this.userEditing.newPassword);
        }
        this.userUpdating = true;

        this.restService.editUser(this.userEditing
        ).subscribe(data => {
            console.log("data :" + JSON.stringify(data));
            this.userUpdating = false;

            if (data["success"]) {
                $.notify({
                    icon: "ti-save",
                    message: "User is updated"
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
                    message: "User is not updated: " + data["message"] + " " + data["errorId"]
                }, {
                    type: "warning",
                    delay: 900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
        }, error => { 
            show403Error(error); 
            this.userUpdating = false;
        });
    }



    cancelEditLiveStream(): void {
        this.dialogRef.close();
    }

}