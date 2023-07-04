import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { FormsModule } from '@angular/forms';

import {HttpClientModule} from '@angular/common/http';
import { SearchComponent } from './search.component';
import { CommonModule } from '@angular/common';

export const SearchRoutes: Routes = [
  {
      path: '',
      component: SearchComponent,
      pathMatch: 'full',
  },
];

  
@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    RouterModule.forChild(SearchRoutes),
    CommonModule,
    HttpClientModule,
    FormsModule,
  ],
  exports: [
    //SearchComponent
  ]
})
export class SearchModule { }
  
