import { Component, Inject } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, User } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ServerSettingsComponent} from "..//server.settings.component"

declare var $: any;
declare var swal: any;


@Component({
    selector: 'user-edit-dialog',
    templateUrl: 'user.edit.dialog.component.html',
})

export class UserEditComponent {

    loading = false;
    public userUpdating = false;
    public userEditing: User;
    public userNameEmpty = false;
    public currentUserType : string;
    public AdminUserType : string = "ADMIN";
    public ReadOnlyUserType : string = "READ_ONLY";

    constructor(
        public dialogRef: MatDialogRef<UserEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            console.log(data.email + " anan " + data.type)
            this.currentUserType = data.type;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    UserTypeChanged(event:any){

        if(event == this.AdminUserType) {
            this.currentUserType = this.AdminUserType;
        }
        if(event == this.ReadOnlyUserType) {
            this.currentUserType = this.ReadOnlyUserType;
        }
    }
    updateUser(isValid: boolean): void {
        if (!isValid) {
            return;
        }

        this.userEditing = new User(this.dialogRef.componentInstance.data.email, "");
        
        this.userEditing.userType= this.currentUserType;
        this.userEditing.newPassword = this.dialogRef.componentInstance.data.newPassword;
        if(this.userEditing.newPassword == undefined){
            this.userEditing.newPassword = "";
        }

        console.log("icerden = " +  this.userEditing.email + "type = " + this.userEditing.userType + "pass = " + this.userEditing.newPassword);

        if (!this.restService.checkStreamName(this.userEditing.email)){
            this.userNameEmpty = true;
            return;
        }
        this.userUpdating = true;

        this.restService.editUser(this.userEditing
        ).subscribe(data => {
            console.log("data :" + JSON.stringify(data));
            this.userUpdating = false;

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



    cancelEditLiveStream(): void {
        this.dialogRef.close();
    }

}