import {Routes} from '@angular/router';

import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {AuthLayoutComponent} from './layouts/auth/auth-layout.component';
import {AuthService} from './rest/auth.service';

export const AppRoutes: Routes = [{
        path: '',
     //   redirectTo: 'dashboard/overview',
        redirectTo: 'applications',
        pathMatch: 'full',
    },{
        path: '',
        component: AdminLayoutComponent,
        children: [{
            path: 'dashboard',
            loadChildren: './dashboard/dashboard.module#DashboardModule',
            canActivate: [AuthService]
        },{
            path: 'serverSettings',
            loadChildren: './server.settings/server.settings.module#ServerSettingsModule',
            canActivate: [AuthService]
        },{
            path: 'logs',
            loadChildren: './logs/logs.module#LogsModule',
            canActivate: [AuthService]
        }
        ,{
            path: 'applications',
            loadChildren: './app.page/app.page.module#AppPageModule',
            canActivate: [AuthService]
        },{
            path: 'cluster',
            loadChildren: './cluster/cluster.module#ClusterModule',
            canActivate: [AuthService]
        },{
            path: 'support',
            loadChildren: './support/support.module#SupportModule',
            canActivate: [AuthService]
        },{
            path: 'forms',
            loadChildren: './forms/forms.module#Forms',
            canActivate: [AuthService]
        },{
            path: 'tables',
            loadChildren: './tables/tables.module#TablesModule',
            canActivate: [AuthService]
        },{
            path: 'maps',
            loadChildren: './maps/maps.module#MapsModule',
            canActivate: [AuthService]
        },{
            path: 'charts',
            loadChildren: './charts/charts.module#ChartsModule',
            canActivate: [AuthService]
        },{
            path: 'calendar',
            loadChildren: './calendar/calendar.module#CalendarModule',
            canActivate: [AuthService]
        },
        {
            path: '',
            loadChildren: './userpage/user.module#UserModule',
            canActivate: [AuthService]
        },
        {
            path: '',
            loadChildren: './timeline/timeline.module#TimelineModule',
            canActivate: [AuthService]
        }]
        },{
            path: '',
            component: AuthLayoutComponent,
            children: [{
                path: 'pages',
                loadChildren: './pages/pages.module#PagesModule'
            }]
        }
];
