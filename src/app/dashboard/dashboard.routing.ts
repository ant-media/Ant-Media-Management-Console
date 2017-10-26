import { Routes } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';

export const DashboardRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'overview'
            },
            {
                path: 'overview',
                component: OverviewComponent
            }]
    }];
