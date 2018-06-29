import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {ServerSettingsComponent} from './server.settings.component';
import { ServerSettingsRoutes } from './server.setings.routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ServerSettingsRoutes),
        FormsModule
    ],
    declarations: [ServerSettingsComponent ]

})

export class ServerSettingsModule {}
