import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService } from '../../rest/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { REST_SERVICE_ROOT } from '../../rest/rest.service';

declare var $:any;

@Component({
    moduleId:module.id,
    selector: 'login-cmp',
    templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit{
    test : Date = new Date();
    private toggleButton;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    public email = "";
    public password = "";
    public showIncorrectCredentials = false;

    constructor(private element : ElementRef, private auth: AuthService, private http:HttpClient, private router: Router) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        
        console.log("---- " + this.auth.test());
    }
    checkFullPageBackgroundImage(){
        var $page = $('.full-page');
        var image_src = $page.data('image');

        if(image_src !== undefined){
            var image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
            $page.append(image_container);
        }
    };

    ngOnInit(){
        this.checkFullPageBackgroundImage();

        this.logout();

        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

        setTimeout(function(){
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
        }, 700)
    }

    logout() {
        console.log("log out---");
       // localStorage.setItem("authenticated", null);
        localStorage.clear();
        //this.router.navigateByUrl("/pages/login");
    }

    sidebarToggle(){
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if(this.sidebarVisible == false){
            setTimeout(function(){
                toggleButton.classList.add('toggled');
            },500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }

    loginUser() {
        console.log("e-mail:" + this.email + " pass:"+ this.password);
        this.auth.login(this.email, this.password).subscribe(data =>{
            console.log(data);
            if (data["success"] == true) {
                localStorage.setItem("authenticated", "true");
                this.router.navigateByUrl("/dashboard");
            }
            else {
                this.showIncorrectCredentials = true;
            }

        });

    }

    credentialsChanged():void {
        this.showIncorrectCredentials = false;
    }

}
