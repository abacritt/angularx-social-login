import {
  NgModule,
  Optional,
  SkipSelf,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialAuthService, SocialAuthServiceConfig } from './socialauth.service';
import { GoogleSigninButtonDirective } from './directives/google-signin-button.directive';

/**
 * The main module of angularx-social-login library.
 */
@NgModule({
  declarations: [GoogleSigninButtonDirective],
  imports: [
    CommonModule
  ],
  providers: [
    SocialAuthService
  ],
  exports: [GoogleSigninButtonDirective]
})
export class SocialLoginModule {
  public static initialize(config: SocialAuthServiceConfig): ModuleWithProviders<SocialLoginModule> {
    return {
      ngModule: SocialLoginModule,
      providers: [
        SocialAuthService,
        {
          provide: 'SocialAuthServiceConfig',
          useValue: config
        }
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: SocialLoginModule) {
    if (parentModule) {
      throw new Error(
        'SocialLoginModule is already loaded. Import it in the AppModule only');
    }
  }
}
