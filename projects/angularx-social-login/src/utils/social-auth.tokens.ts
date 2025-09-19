import {InjectionToken, Type} from '@angular/core';
import {LoginProvider} from "../entities/login-provider";

/**
 * An interface to define the shape of the service configuration options.
 */
export interface SocialAuthServiceConfig {
  autoLogin?: boolean;
  lang?: string;
  providers: { id: string; provider: LoginProvider | Type<LoginProvider> }[];
  onError?: (error: any) => any;
}

export const SOCIAL_AUTH_CONFIG = new InjectionToken<SocialAuthServiceConfig | Promise<SocialAuthServiceConfig>>('SocialAuthServiceConfig');
