import { Component } from '@angular/core';
import { AuthService } from '../rest/auth.service';
import {NgForm} from '@angular/forms';

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

    constructor(private auth: AuthService) {
        this.showPasswordNotChangedError = false;
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
                        this.showPasswordNotChangedError = false;

                        $.notify({
                            icon: "ti-save",
                            message: "Your password has been changed"
                          }, {
                              type: "info",
                              delay: 3000,
                              placement: {
                                from: 'top',
                                align: 'center'
                              }
                            });

                    }
                    else {
                        this.showPasswordNotChangedError = true;
                    }
                    
                });
    }

 }
