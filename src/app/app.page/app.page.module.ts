import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AppPageComponent} from './app.page.component';
import {ClipboardModule} from 'ngx-clipboard';
import {MatGridListModule} from '@angular/material/grid-list'
import {MatIconModule} from '@angular/material/icon'
import {MatInputModule} from '@angular/material/input'
import {MatListModule} from '@angular/material/list'
import {MatMenuModule} from '@angular/material/menu'
import {MatNativeDateModule} from '@angular/material/core'
import {MatPaginatorModule} from '@angular/material/paginator'
import {MatSelectModule} from '@angular/material/select'
import {MatRippleModule} from '@angular/material/core'
import {MatRadioModule} from '@angular/material/radio'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import {MatProgressBarModule} from '@angular/material/progress-bar'
import {MatTooltipModule} from '@angular/material/tooltip'
import {MatToolbarModule} from '@angular/material/toolbar'
import {MatTabsModule} from '@angular/material/tabs'
import {MatTableModule} from '@angular/material/table'
import {MatStepperModule} from '@angular/material/stepper'
import {MatSortModule} from '@angular/material/sort'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {MatSlideToggleModule} from '@angular/material/slide-toggle'
import {MatSliderModule} from '@angular/material/slider'
import {MatSidenavModule} from '@angular/material/sidenav'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatButtonModule} from '@angular/material/button'
import {MatButtonToggleModule} from '@angular/material/button-toggle'
import {MatCardModule} from '@angular/material/card'
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatChipsModule} from '@angular/material/chips'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatDialogModule} from '@angular/material/dialog'
import {MatDividerModule} from '@angular/material/divider'
import {MatExpansionModule} from '@angular/material/expansion'
import {MatFormFieldModule} from '@angular/material/form-field'
import {DetectedObjectListDialog} from './dialog/detected.objects.list';
import {UploadVodDialogComponent} from './dialog/upload-vod-dialog';
import {BroadcastEditComponent} from './dialog/broadcast.edit.dialog.component';
import {SocialMediaStatsComponent} from './dialog/social.media.stats.component';
import {WebRTCClientStatsComponent} from './dialog/webrtcstats/webrtc.client.stats.component';
import {RtmpEndpointEditDialogComponent} from './dialog/rtmp.endpoint.edit.dialog.component';
import {PlaylistEditComponent} from "./dialog/playlist.edit.dialog.component";

export const AppPageRoutes: Routes = [
    {
        path: '',
        component: AppPageComponent, //redirects to first app
        pathMatch: 'full',
    },
    {
        path: ':appname',
        component: AppPageComponent,

    }];

@NgModule({

    declarations: [
                    AppPageComponent,
                    UploadVodDialogComponent,
                    BroadcastEditComponent,
                    DetectedObjectListDialog,
                    SocialMediaStatsComponent,
                    WebRTCClientStatsComponent,
                    RtmpEndpointEditDialogComponent,
                    PlaylistEditComponent,
                ],

    entryComponents: [
                        AppPageComponent,
                        UploadVodDialogComponent,
                        BroadcastEditComponent,
                        DetectedObjectListDialog,
                        SocialMediaStatsComponent,
                        WebRTCClientStatsComponent,
                        RtmpEndpointEditDialogComponent,
                        PlaylistEditComponent
                    ],
    bootstrap: [AppPageComponent],

    imports: [

        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatDialogModule,
        RouterModule.forChild(AppPageRoutes),
        FormsModule,
        HttpClientModule,
        ClipboardModule,
        MatDialogModule,
        MatCheckboxModule,
        MatInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule
    ],

    exports: [MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule,
        MatDialogModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule],

})

export class AppPageModule {
}
