import { Component, OnInit } from '@angular/core';

import { GoogleLoginProvider, SocialAuthService } from 'lib';
import { SocialUser } from 'lib';


@Component({
  selector: 'lib-app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css'],
})
export class DemoComponent implements OnInit {
  user: SocialUser | undefined;
  GoogleLoginProvider = GoogleLoginProvider;

  constructor(private readonly authService: SocialAuthService) {}

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
    });
  }
  signOut(): void {
    this.authService.signOut();
  }

  refreshGoogleToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }
}
