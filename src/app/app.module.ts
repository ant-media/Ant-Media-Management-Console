import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { APP_BASE_HREF , LocationStrategy, HashLocationStrategy} from '@angular/common';
import { FormsModule } from '@angular/forms';


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



@NgModule({
    imports:      [
        BrowserModule,
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
        AuthService,
        RestService,
        {provide: LocationStrategy, useClass: HashLocationStrategy}
    ],
    bootstrap: [ AppComponent ]
})

export class AppModule { }
