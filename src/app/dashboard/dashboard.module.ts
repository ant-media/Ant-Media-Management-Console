import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {OverviewComponent} from './overview/overview.component';
import {DashboardRoutes} from './dashboard.routing';
import {HttpClientModule} from '@angular/common/http';
import {DataService} from "../rest/data.service";
import {ServerSettingsComponent} from "../server.settings/server.settings.component";
import {MatDialogModule} from '@angular/material/dialog';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        FormsModule,
        HttpClientModule,
        MatDialogModule
    ],
    declarations: [OverviewComponent],
    providers: [DataService,ServerSettingsComponent],

})

export class DashboardModule {}
