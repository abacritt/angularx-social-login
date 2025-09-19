import { EventEmitter } from '@angular/core';
import { LoginProvider } from './login-provider';
import { SocialUser } from './social-user';

export abstract class BaseLoginProvider implements LoginProvider {
  protected constructor() {}
  readonly changeUser?: EventEmitter<SocialUser>;
  abstract initialize(autoLogin?: boolean, lang?: string): Promise<void>;
  abstract getLoginStatus(): Promise<SocialUser>;
  abstract signIn(signInOptions?: object): Promise<SocialUser>;
  abstract signOut(revoke?: boolean): Promise<void>;
  refreshToken?(): Promise<SocialUser | null>;

  protected loadScript(
    id: string,
    src: string,
    onload: any,
    parentElement: any = null
  ): void {
    // get document if platform is only browser
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      let signInJS = document.createElement('script');

      signInJS.async = true;
      signInJS.src = src;
      signInJS.onload = onload;

      if (!parentElement) {
        parentElement = document.head;
      }

      parentElement.appendChild(signInJS);
    }
  }
}
