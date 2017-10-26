import { Routes } from '@angular/router';

import { ExtendedTableComponent } from './extendedtable/extendedtable.component';
import { RegularTableComponent } from './regulartable/regulartable.component';
import { DataTableComponent } from './datatable.net/datatable.component';

export const TablesRoutes: Routes = [{
        path: '',
        children: [{
            path: 'regular',
            component: RegularTableComponent
        }]
    },{
        path: '',
        children: [{
            path: 'extended',
            component: ExtendedTableComponent
        }]
    },{
        path: '',
        children: [ {
            path: 'datatables.net',
            component: DataTableComponent
        }]
    }
];
