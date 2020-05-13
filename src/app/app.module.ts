import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DemoComponent } from './demo/demo.component';

import { SocialLoginModule } from 'lib';
import {
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
  AmazonLoginProvider
} from 'lib';

@NgModule({
  declarations: [AppComponent, NavbarComponent, DemoComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule, SocialLoginModule],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: () => {
        return new AuthServiceConfig([
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '624796833023-clhjgupm0pu6vgga7k5i5bsfp6qp6egh.apps.googleusercontent.com'
            ),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('561602290896109'),
          },
          {
            id: AmazonLoginProvider.PROVIDER_ID,
            provider: new AmazonLoginProvider(
              'amzn1.application-oa2-client.f074ae67c0a146b6902cc0c4a3297935'
            ),
          },
        ]);
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
