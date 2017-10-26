import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { Routes } from '@angular/router';
import { AppPageComponent } from './app.page.component';
import { ClipboardModule } from 'ngx-clipboard';

export const AppPageRoutes: Routes = [
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
    ],
    declarations: [AppPageComponent]
})

export class AppPageModule {}
