import { 
	NgModule
 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
    imports: [ RouterModule, CommonModule ,HttpClientModule],
    declarations: [ FooterComponent ],
    exports: [ FooterComponent ]
})

export class FooterModule {

}
