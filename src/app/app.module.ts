import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { APP_BASE_HREF , LocationStrategy, HashLocationStrategy} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {BrowserAnimationsModule,NoopAnimationsModule} from '@angular/platform-browser/animations';


import { AppComponent }   from './app.component';

import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule} from './shared/navbar/navbar.module';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { AppRoutes } from './app.routing';
import { AuthService } from './rest/auth.service';
import { RestService } from './rest/rest.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
//import { AuthInterceptor } from './rest/auth.interceptor';
import { ClipboardModule } from 'ngx-clipboard';
import { Locale } from './locale/locale';
import {AppPageComponent} from "./app.page/app.page.component";



@NgModule({
    imports:      [
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forRoot(AppRoutes),
        HttpModule,
        SidebarModule,
        NavbarModule,
        FooterModule,
        ClipboardModule  
    ],
    declarations: [
        AppComponent,
        AdminLayoutComponent,
        AuthLayoutComponent
    ],
    providers: [
        AppPageComponent,
        AuthService,
        RestService,
        Locale,
        {provide: LocationStrategy, useClass: HashLocationStrategy}
    ],
    bootstrap: [ AppComponent ]
})

export class AppModule { }
