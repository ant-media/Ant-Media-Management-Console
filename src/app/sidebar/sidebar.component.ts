import { Component, OnInit, AfterViewInit, AfterViewChecked, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestService, show403Error } from '../rest/rest.service';
import { isScopeSystem, LOCAL_STORAGE_SCOPE_KEY, APP_NAME_USER_TYPE } from 'app/rest/auth.service';

declare var $: any;
declare var swal: any;
//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    icontype: string;
    // icon: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
}

//Menu Items

export const ROUTES: RouteInfo[] = [{
    path: '/dashboard',
    title: 'Dashboard',
    type: 'link',
    icontype: 'ti-panel',

}, {
    path: '/applications',
    title: 'Applications',
    type: 'sub',
    icontype: 'ti-package',
    children: [
    ]
}, {
    path: '/cluster',
    title: 'Cluster',
    type: 'link',
    icontype: 'ti-layout-grid3',

}, {
    path: '/settings',
    title: 'Settings',
    type: 'link',
    icontype: 'ti-settings',
}, {
    path: '/support',
    title: 'Support',
    type: 'link',
    icontype: 'ti-support',
}
];


@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements AfterViewInit {
    public menuItems: any[];
    public static apps: string[];
    public isClusterMode = false;
    public scope: string;

    constructor(private http: HttpClient, private restService: RestService) { }


    isNotMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    }

    openCalendlyLink() {
        swal({
            title: 'Get a Free Consultancy',
            text: 'You will be redirected to Calendly to schedule a free consultancy session. Do you want to continue?',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#51cbce',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue',
            cancelButtonText: 'Cancel'
        }).then(() => {
            window.open('https://calendly.com/antmedia', '_blank');
        });
    }

    ngOnInit() {
        var isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;
        this.menuItems = ROUTES.filter(menuItem => menuItem);

        isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

        if (isWindows) {
            // if we are on windows OS we activate the perfectScrollbar function
            $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();
            $('html').addClass('perfect-scrollbar-on');
        } else {
            $('html').addClass('perfect-scrollbar-off');
        }

        this.restService.setSidebar(this);

        //this.scope = localStorage.getItem(LOCAL_STORAGE_SCOPE_KEY);

        var appNameUserTypeStr = localStorage.getItem(APP_NAME_USER_TYPE);
        if(appNameUserTypeStr == null || appNameUserTypeStr == ""){
            return;
        }

        var appNameUserTypeJson = JSON.parse(appNameUserTypeStr)
        console.log(appNameUserTypeJson)
        
        if("system" in appNameUserTypeJson){
            this.scope = "system"
        }

        if ("system" in appNameUserTypeJson) {
            
            //Init applications if the scope is system
            this.initApplications();
            this.restService.isInClusterMode().subscribe(data => {
                this.isClusterMode = data['success'];
            }, error => { show403Error(error); });
        }
        else {
            console.log("init menu application items")
            this.initMenuApplicationItems(Object.keys(appNameUserTypeJson));
        }
        
       
    }
    ngAfterViewInit() {
    }

    initApplications() {
        this.restService.getApplications().subscribe(data => 
            {
                this.initMenuApplicationItems(data["applications"]);
        });
    }
    get getApps() {
        return SidebarComponent.apps;
    }

    initMenuApplicationItems(applications:string[]) 
    {
        SidebarComponent.apps = [];
         //second element is the Applications. It is not safe to make static binding.
        this.menuItems[1].children = [];
        for (var i in applications) 
        {
            this.menuItems[1].children.push({ path: applications[i], title: applications[i], icontype: 'ti-file' });
            SidebarComponent.apps.push(applications[i]); 
        }
    }

    

}
