import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NguiMapModule} from '@ngui/map';

import { MapsRoutes } from './maps.routing';

import { FullScreenMapsComponent } from './fullscreenmap/fullscreenmap.component';
import { GoogleMapsComponent } from './googlemaps/googlemaps.component';
import { VectorMapsComponent } from './vectormaps/vectormaps.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(MapsRoutes),
        FormsModule,
        NguiMapModule.forRoot({apiUrl: 'https://maps.google.com/maps/api/js?key=AIzaSyBr-tgUtpm8cyjYVQDrjs8YpZH7zBNWPuY'})
    ],
    declarations: [
        FullScreenMapsComponent,
        GoogleMapsComponent,
        VectorMapsComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class MapsModule {}
