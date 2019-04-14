import {Routes} from '@angular/router';

import {ServerSettingsComponent} from './server.settings.component';

export const ServerSettingsRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: ServerSettingsComponent
    }]
}];
