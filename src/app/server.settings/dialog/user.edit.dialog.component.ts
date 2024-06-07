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

    public addMoreApplicationAccessButtonVisible:boolean = false;


    constructor(
        public dialogRef: MatDialogRef<UserEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            var mUser:User = data.user
            console.log(mUser)

            console.debug(mUser.email + " - " + mUser.userType)
            this.userEditing = new User(mUser.email,"");
            this.userEditing.scope = mUser.scope;
            this.userEditing.userType = mUser.userType;
            this.userEditing.appNameUserType = mUser.appNameUserType



    }

    ngOnInit(){
        this.restService.getApplications().subscribe(data => {
            this.applications = data;
            console.log(this.applications.applications)
            this.isShowAddMoreApplicationAccessButton()
        }, error => { show403Error(error); });

    }

    isShowAddMoreApplicationAccessButton():void{
        const keys = Object.keys(this.userEditing.appNameUserType);
        var systemScopeFound = false;
        
        for (const key of keys) {
            if (key === this.SYSTEM_SCOPE_OF_ACCESS) {
                systemScopeFound = true;
                break;
            }
        }

        if(systemScopeFound){
            this.addMoreApplicationAccessButtonVisible = false;
            return;
        }

        if(this.applications.applications.length > Object.keys(this.userEditing.appNameUserType).length){
            this.addMoreApplicationAccessButtonVisible = true;
        }else{
            this.addMoreApplicationAccessButtonVisible = false;
        }

    }

    addMoreApplicationAccess(): void {
        const existingKeys = Object.keys(this.userEditing.appNameUserType);
            for (const app of this.applications.applications) {
            if (!existingKeys.includes(app)) {
                this.userEditing.appNameUserType[app] = this.AdminUserType
                console.log("Adding", app);
                break;
            }
        }
    console.log(this.userEditing.appNameUserType)
     this.isShowAddMoreApplicationAccessButton()
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

    deleteScope(i: number): void {
        if(Object.keys(this.userEditing.appNameUserType).length == 1){
            //wont come since i hide delete icon.
            alert("At least 1 app scope is required.")
            return
        }

        Object.keys(this.userEditing.appNameUserType).forEach((key, index) => {
            if (i === index) {
                delete this.userEditing.appNameUserType[key];
            }
        });
        this.isShowAddMoreApplicationAccessButton()

    }

    hasMoreThanOneAppScope(): boolean {
        return Object.keys(this.userEditing.appNameUserType).length > 1;
    }


    onUserTypeChange(e:any, appName:string){
        const selectedUserType = e.target.value

        console.log(selectedUserType)

        this.userEditing.appNameUserType[appName] = selectedUserType

        console.log(this.userEditing.appNameUserType)

    }

    onScopeChange(e: any, index: number) {
        const selectedApp = e.target.value;

        if (selectedApp === this.SYSTEM_SCOPE_OF_ACCESS) { 
            const keys = Object.keys(this.userEditing.appNameUserType);
            keys.forEach((key, idx) => {
                if (idx !== index) {
                    delete this.userEditing.appNameUserType[key];
                } else {
                    const value = this.userEditing.appNameUserType[key];
                    delete this.userEditing.appNameUserType[key];
                    this.userEditing.appNameUserType[this.SYSTEM_SCOPE_OF_ACCESS] = value;
                }
            });
         
        }else{

            const keys = Object.keys(this.userEditing.appNameUserType);
            keys.forEach((key, idx) => {
                if(idx === index){
                        
                    const value = this.userEditing.appNameUserType[key];
                    delete this.userEditing.appNameUserType[key];
                    this.userEditing.appNameUserType[selectedApp] = value;

                }

            });

        }
        console.log(this.userEditing.appNameUserType)
        this.isShowAddMoreApplicationAccessButton()
    }


}