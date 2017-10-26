import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { PasswordValidation } from './password-validator.component';

declare var $: any;
declare interface User {
    text?: string;
    email?: string; //  must be valid email format
    password?: string; // required, value must be equal to confirm password.
    confirmPassword?: string; // required, value must be equal to password.
    number?: number; // required, value must be equal to password.
    url?: string;
    idSource?: string;
    idDestination?: string;
}

@Component({
    moduleId: module.id,
    selector: 'validationforms-cmp',
    templateUrl: 'validationforms.component.html'
})

export class ValidationFormsComponent{

    public register: User;
    public login: User;
    public typeValidation: User;

    ngOnInit() {
        this.register = {
            email: '',
            password: '',
            confirmPassword: ''
        }
        this.login = {
            email: '',
            password: ''
        }
        this.typeValidation = {
            text: '',
            email: '',
            idSource: '',
            idDestination: '',
            url: ''
        }
    }

    save(model: User, isValid: boolean) {
    // call API to save customer
        if(isValid){
            console.log(model, isValid);
        }
    }
    save1(model: User, isValid: boolean) {
    // call API to save customer
        if(isValid){
            console.log(model, isValid);
        }
    }
    save2(model: User, isValid: boolean) {
    // call API to save customer
        if(isValid){
            console.log(model, isValid);
        }
    }
    onSubmit(value: any):void{
        console.log(value);
    }
}
