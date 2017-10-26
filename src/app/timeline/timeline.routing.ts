import { Routes } from '@angular/router';

import { TimelineComponent } from './timeline.component';

export const TimelineRoutes: Routes = [{
    path: '',
    children: [{
        path: 'pages/timeline',
        component: TimelineComponent
    }]
}];
