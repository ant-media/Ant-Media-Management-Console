import { Component, OnInit, AfterViewInit, AfterViewChecked, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../rest/rest.service';


declare var $: any;
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

    constructor(private http: HttpClient, private restService: RestService) { }


    isNotMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
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


        this.restService.getApplications().subscribe(data => {
            SidebarComponent.apps = [];

            //second element is the Applications. It is not safe to make static binding.
            this.menuItems[1].children = [];
            for (var i in data['applications']) {
                //console.log(data['applications'][i]);
                this.menuItems[1].children.push({ path: data['applications'][i], title: data['applications'][i], icontype: 'ti-file' });
                SidebarComponent.apps.push(data['applications'][i]);

            }
        });
        
        this.restService.isInClusterMode().subscribe(data => {
            this.isClusterMode = data['success'];
        });


    }
    ngAfterViewInit() {
        $("#Applications").collapse("show");
    }

    get getApps() {
        return SidebarComponent.apps;
    }

}
