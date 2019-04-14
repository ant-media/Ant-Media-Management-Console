import {Routes} from '@angular/router';

import {LogsComponent} from './logs.component';

export const LogsRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: LogsComponent
    }]
}];
