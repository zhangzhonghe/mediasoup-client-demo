import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { RtcVideoComponent } from './rtc-video.component';
import { LoadingComponent } from './loading/loading.component';
import { VolumeControlComponent } from './volume-control/volume-control.component';

@NgModule({
    declarations: [
        RtcVideoComponent,
        LoadingComponent,
        VolumeControlComponent,
    ],
    exports: [
        RtcVideoComponent
    ],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatSliderModule,
        MatIconModule,
        MatButtonModule
    ]
})
export class RtcVideoModule {
}
