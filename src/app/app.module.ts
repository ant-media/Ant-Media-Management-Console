import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {DatePipe, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


import {AppComponent} from './app.component';

import {SidebarModule} from './sidebar/sidebar.module';
import {FooterModule} from './shared/footer/footer.module';
import {NavbarModule} from './shared/navbar/navbar.module';
import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {AuthLayoutComponent} from './layouts/auth/auth-layout.component';
import {AppRoutes} from './app.routing';
import {AuthService} from './rest/auth.service';
import {AuthInterceptor, RestService,} from './rest/rest.service';
import {ClusterRestService} from './rest/cluster.service';
import {SupportRestService} from './rest/support.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
//import { AuthInterceptor } from './rest/auth.interceptor';
import {ClipboardModule} from 'ngx-clipboard';
import {Locale} from './locale/locale';
import {AppPageComponent} from "./app.page/app.page.component";
import {DataService} from "./rest/data.service";


@NgModule({
    imports:      [
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forRoot(AppRoutes),
        SidebarModule,
        NavbarModule,
        FooterModule,
        ClipboardModule
    ],
    declarations: [
        AppComponent,
        AdminLayoutComponent,
        AuthLayoutComponent,

    ],
    providers: [
        AppPageComponent,
        AuthService,
        RestService,
        ClusterRestService,
        SupportRestService,
        Locale,
        DataService,
        DatePipe,
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        //{provide: RequestOptions, useClass: CustomRequestOptions},
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [ AppComponent ]
})

export class AppModule { }
