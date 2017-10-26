import { Component } from '@angular/core';
import { AuthService } from '../rest/auth.service';

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

    constructor(private auth: AuthService) {
        this.showPasswordNotChangedError = false;
    }


    updatePassword(isValid: boolean):void {
        if (!isValid) {
            return;
        }
        console.log("current pass: " + this.currentPassword);
        this.auth.changeUserPassword("nope", this.currentPassword, this.newPasswordAgain)
                .subscribe(data => {
                    console.log(data);
                    if (data["success"]) {

                        this.showPasswordNotChangedError = false;
                    }
                    else {
                        this.showPasswordNotChangedError = true;
                    }
                    
                });
    }

 }
