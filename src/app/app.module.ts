import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RtcVideoModule } from './components/video-player-webrtc/rtc-video.module';
import { GraphqlModule } from 'src/graphql/graphql.module';

import { MatIconRegistry } from '@angular/material/icon';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        GraphqlModule,
        RtcVideoModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer
  ) {
    /*
    * Material Design Icons.
    * view on https://materialdesignicons.com
    */
    matIconRegistry.addSvgIconSetInNamespace(
        'mdi',
        domSanitizer.bypassSecurityTrustResourceUrl('assets/mdi.svg')
    );
  }
}
