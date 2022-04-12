import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {ServerSettingsComponent} from './server.settings.component';
import {ServerSettingsRoutes} from './server.setings.routing';
import {DataService} from "../rest/data.service";
import {MatTableModule} from '@angular/material/table'
import {MatPaginatorModule} from '@angular/material/paginator'
import {MatDialogModule} from '@angular/material/dialog'
import {UserEditComponent} from './dialog/user.edit.dialog.component';
import { EqualValidator } from './equal-validator.directive';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ServerSettingsRoutes),
        FormsModule, 
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatTooltipModule
    ],
    declarations: [ServerSettingsComponent, UserEditComponent , EqualValidator],
    providers: [DataService],

})

export class ServerSettingsModule {}
