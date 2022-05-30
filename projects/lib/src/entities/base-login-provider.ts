import { Observable } from 'rxjs';
import { LoginProvider } from './login-provider';
import { SocialUser } from './social-user';

export abstract class BaseLoginProvider implements LoginProvider {
  constructor() {}

	readonly socialUser$?: Observable<SocialUser>;
	readonly initialized$?: Observable<true>;
  
  abstract initialize(): Promise<void>;
  abstract getLoginStatus(): Promise<SocialUser>;
  abstract signIn(): Promise<SocialUser>;
  abstract signOut(revoke?: boolean): Promise<void>;

  protected loadScript(
    id: string,
    src: string,
    onload: any,
    parentElement = null
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
