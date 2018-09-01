import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


import {HttpClientModule} from '@angular/common/http';
import {
    AppPageComponent,
    CamSettinsDialogComponent
} from './app.page.component';
import {ClipboardModule} from 'ngx-clipboard';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
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
} from '@angular/material';
import { DetectedObjectListDialog } from './dialog/detected.objects.list';
import { UploadVodDialogComponent } from './dialog/upload-vod-dialog';
import { StreamSourceEditComponent } from './dialog/stream.source.edit.component';
import { BroadcastEditComponent } from './dialog/broadcast.edit.dialog.component';


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

    declarations: [AppPageComponent, CamSettinsDialogComponent, UploadVodDialogComponent, BroadcastEditComponent,
                    DetectedObjectListDialog, StreamSourceEditComponent],

    entryComponents: [
        CamSettinsDialogComponent, AppPageComponent, UploadVodDialogComponent, BroadcastEditComponent,
        DetectedObjectListDialog,StreamSourceEditComponent

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
