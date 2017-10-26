import { Routes } from '@angular/router';

import { ChartsComponent } from './charts.component';

export const ChartsRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: ChartsComponent
    }]
}];
