import { Component } from '@angular/core';
import { AuthService } from '../rest/auth.service';
import { NgForm } from '@angular/forms';
import { show403Error } from '../rest/rest.service';

declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'user-cmp',
    templateUrl: 'user.component.html'
})

export class UserComponent{

    public currentPassword: string;
    public newPassword: string;
    public newPasswordAgain: string;
    public showPasswordNotChangedError: boolean;
    public showYourPasswordChanged: boolean;

    constructor(private auth: AuthService) {
        this.showPasswordNotChangedError = false;
        this.showYourPasswordChanged = false;
    }


    updatePassword(isValid: boolean, form: NgForm):void {
        if (!isValid) {
            return;
        }
        
        this.auth.changeUserPassword("nope", this.currentPassword, this.newPasswordAgain)
                .subscribe(data => {
                  
                    console.log(data);
                    if (data["success"]) {
                        form.resetForm();
                        this.showYourPasswordChanged = true;
                        this.showPasswordNotChangedError = false;
                    }
                    else {
                        this.showPasswordNotChangedError = true;
                    }
                    
                }, error => { show403Error(error); });
    }

 }
