import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { Routes } from '@angular/router';
import { AppPageComponent } from './app.page.component';
import { ClipboardModule } from 'ngx-clipboard';

import {MatButtonModule, MatCheckboxModule} from '@angular/material';


export const AppPageRoutes: Routes = [
    {
        path: '',
        component:AppPageComponent, //redirects to first app
        pathMatch: 'full',
    },
    {
        path: ':appname',
        component:AppPageComponent,
       
    }];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AppPageRoutes),
        FormsModule,
        HttpClientModule,
        ClipboardModule,

        MatButtonModule,
        MatCheckboxModule


    ],
    exports: [MatButtonModule, MatCheckboxModule],
    declarations: [AppPageComponent]
})

export class AppPageModule {}
