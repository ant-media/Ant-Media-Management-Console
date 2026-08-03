import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {PluginsComponent} from './plugins.component';
import {PluginsRoutes} from './plugins.routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(PluginsRoutes),
        FormsModule
    ],
    declarations: [PluginsComponent]
})

export class PluginsModule {}
