import {Component, inject, OnInit} from '@angular/core';

import {
  GoogleLoginProvider,
  GoogleSigninButtonDirective,
  SocialAuthService,
} from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import {
  FacebookLoginProvider,
  AmazonLoginProvider,
  VKLoginProvider,
  MicrosoftLoginProvider,
} from 'angularx-social-login';

@Component({
  selector: 'lib-app-demo',
  imports: [GoogleSigninButtonDirective],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css'],
  standalone: true
})
export class DemoComponent implements OnInit {
  user: SocialUser | undefined;
  GoogleLoginProvider = GoogleLoginProvider;
  _authService = inject(SocialAuthService)!;

  ngOnInit() {
    this._authService.authState.subscribe((user) => {
      this.user = user;
    });
  }

  signInWithFB(): void {
    this._authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signInWithAmazon(): void {
    this._authService.signIn(AmazonLoginProvider.PROVIDER_ID);
  }

  signInWithVK(): void {
    this._authService.signIn(VKLoginProvider.PROVIDER_ID);
  }

  signInWithMicrosoft(): void {
    this._authService.signIn(MicrosoftLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this._authService.signOut();
  }

  refreshGoogleToken(): void {
    this._authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }
}
