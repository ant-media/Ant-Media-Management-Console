import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {ServerSettingsComponent} from './server.settings.component';
import {ServerSettingsRoutes} from './server.setings.routing';
import {DataService} from "../rest/data.service";


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ServerSettingsRoutes),
        FormsModule
    ],
    declarations: [ServerSettingsComponent ],
    providers: [DataService],

})

export class ServerSettingsModule {}
