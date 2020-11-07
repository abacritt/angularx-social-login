import { LoginProvider } from './login-provider';
import { SocialUser } from './social-user';

enum Status {
  NOT_LOADED,
  LOADING,
  LOADED,
}

export abstract class BaseLoginProvider implements LoginProvider {
  constructor() {}

  abstract getLoginStatus(): Promise<SocialUser>;
  abstract signIn(): Promise<SocialUser>;
  abstract signOut(revoke?: boolean): Promise<any>;

  protected readyState: Status = Status.NOT_LOADED;

  protected initialize(
    id: string,
    src: string,
    parentElement: HTMLElement = null,
    onload: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.readyState === Status.LOADED) {
        resolve();
      }

      if (this.readyState !== Status.LOADING) {
        this.readyState = Status.LOADING;

        try {
          this.loadScript(id, src, parentElement, () => {
            onload();

            this.readyState = Status.LOADED;
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  protected loadScript(
    id: string,
    src: string,
    parentElement: HTMLElement = null,
    onload: any
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
