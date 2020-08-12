import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ROUTES} from '../.././sidebar/sidebar.component';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {Locale} from 'app/locale/locale';

var misc:any ={
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0,
}
declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'navbar-cmp',
    templateUrl: 'navbar.component.html'
})

export class NavbarComponent implements OnInit{
    private listTitles: any[];
    location: Location;
    private nativeElement: Node;
    private toggleButton;
    private sidebarVisible: boolean;

    @ViewChild("navbar-cmp") button;

    constructor(location:Location, private renderer : Renderer2, private element : ElementRef, public router:Router) {
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit(){
        this.listTitles = ROUTES.filter(listTitle => listTitle);

        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        if($('body').hasClass('sidebar-mini')){
            misc.sidebar_mini_active = true;
        }
        $('#minimizeSidebar').click(function(){
            var $btn = $(this);

            if(misc.sidebar_mini_active == true){
                $('body').removeClass('sidebar-mini');
                misc.sidebar_mini_active = false;

            }else{
                setTimeout(function(){
                    $('body').addClass('sidebar-mini');

                    misc.sidebar_mini_active = true;
                },300);
            }

            // we simulate the window Resize so the charts will get updated in realtime.
            var simulateWindowResize = setInterval(function(){
                window.dispatchEvent(new Event('resize'));
            },180);

            // we stop the simulation of Window Resize after the animations are completed
            setTimeout(function(){
                clearInterval(simulateWindowResize);
            },1000);
        });
    }

    isMobileMenu(){
        if($(window).width() < 991){
            return false;
        }
        return true;
    }

    sidebarOpen(){
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        setTimeout(function(){
            toggleButton.classList.add('toggled');
        },500);
        body.classList.add('nav-open');
        this.sidebarVisible = true;
    }
    sidebarClose(){
        var body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    }
    sidebarToggle(){
        // var toggleButton = this.toggleButton;
        // var body = document.getElementsByTagName('body')[0];
        if(this.sidebarVisible == false){
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    }

    getTitle(){
        var titlee = this.location.prepareExternalUrl(this.location.path());
      
        if(titlee.charAt(0) === '#'){
            titlee = titlee.slice( 2 );
        }

        for(var item = 0; item < this.listTitles.length; item++){
            var parent = this.listTitles[item];
            
            if(parent.path === titlee){
                return parent.title;
            }else if(parent.children){
                var first_child = titlee.split("/")[0];
                if (first_child == "dashboard") {
                    return Locale.getLocaleInterface().dashboard;
                }
                if (first_child == "applications") {
                    return titlee.split("/")[1];
                }
                if (first_child == "cluster") {
                    return Locale.getLocaleInterface().cluster;
                }

                if (first_child == "serverSettings") {
                    return "Server Settings";
                }
                if (first_child == "logs") {
                    return "Log Settings";
                }
                if (first_child == "support") {
                    return Locale.getLocaleInterface().support;
                }
                /*
                var children_from_url = titlee.split("/")[1];
                
                for(var current = 0; current < parent.children.length; current++){
                    if(parent.children[current].path === children_from_url ){
                        return parent.children[current].title;
                    }
                }
                */
            }
        }
        
        return 'Dashboard';
    }

    getPath(){
        // console.log(this.location);
        return this.location.prepareExternalUrl(this.location.path());
    }

    logout() {
        console.log("log out---");
       // localStorage.setItem("authenticated", null);
        localStorage.clear();
        this.router.navigateByUrl("/pages/login");
    }
}
