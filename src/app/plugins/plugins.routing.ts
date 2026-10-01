import {Routes} from '@angular/router';
import {PluginsComponent} from './plugins.component';

export const PluginsRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: PluginsComponent
    }]
}];
