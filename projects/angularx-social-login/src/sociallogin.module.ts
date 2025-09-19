import { NgModule, ModuleWithProviders, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  SocialAuthService,
} from './socialauth.service';
import {SocialAuthServiceConfig} from "./utils/social-auth.tokens";

/**
 * The main module of angularx-social-login library.
 */
@NgModule({
  imports: [CommonModule],
  providers: [SocialAuthService],
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

  constructor() {
    const parentModule = inject(SocialLoginModule, { optional: true, skipSelf: true })!;

    if (parentModule) {
      throw new Error(
        'SocialLoginModule is already loaded. Import it in the AppModule only');
    }
  }
}
