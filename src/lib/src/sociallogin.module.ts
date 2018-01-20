import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService, AuthServiceConfig } from './auth.service';

export function configFactory(config: AuthServiceConfig) {
  return config;
}

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AuthService
  ]
})
export class SocialLoginModule {

  public static initialize(config: AuthServiceConfig): ModuleWithProviders {
    return {
      ngModule: SocialLoginModule,
      providers: [
        AuthService,
        {
          provide: AuthServiceConfig,
          useValue: config
        }
      ]
    };
  }

}
