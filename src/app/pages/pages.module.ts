import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PagesRoutes } from './pages.routing';

import { RegisterComponent } from './register/register.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { EqualValidator } from './equal-validator.directive';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor} from '../rest/rest.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(PagesRoutes),
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        LoginComponent,
        RegisterComponent,
        LockComponent,
        EqualValidator
    ],
    
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }]
      
})

export class PagesModule {}
