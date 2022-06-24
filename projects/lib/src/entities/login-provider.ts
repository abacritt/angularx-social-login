import { EventEmitter } from '@angular/core';
import { SocialUser } from './social-user';

export interface LoginProvider {
  readonly changeUser?: EventEmitter<SocialUser>;
  initialize(autoLogin?: boolean): Promise<void>;
  getLoginStatus(): Promise<SocialUser>;
  signIn(signInOptions?: object): Promise<SocialUser>;
  signOut(revoke?: boolean): Promise<void>;
  refreshToken?(): Promise<SocialUser | null>;
}
