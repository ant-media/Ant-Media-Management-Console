import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LogsComponent } from './logs.component';
import { HttpClientModule } from '@angular/common/http';
import {LogsRoutes} from "./logs.routing";



@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(LogsRoutes),
        FormsModule,
        HttpClientModule,
    ],
    declarations: [LogsComponent],
})

export class LogsModule {}