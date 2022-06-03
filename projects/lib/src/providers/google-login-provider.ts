import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';
import { LoginProvider } from '../entities/login-provider';
import { decodeJwt } from 'jose';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';

export class GoogleLoginProvider
  extends BaseLoginProvider
  implements LoginProvider
{
  private readonly _socialUser = new BehaviorSubject<SocialUser | null>(null);
  public static readonly PROVIDER_ID: string = 'GOOGLE';
  public readonly signedIn = new EventEmitter<SocialUser>();

  constructor(private clientId: string) {
    super();

    // emit signedIn event on new SocialUser instance
    this._socialUser
      .pipe(filter((user) => user instanceof SocialUser))
      .subscribe(this.signedIn);
  }

  initialize(autoLogin?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(
          GoogleLoginProvider.PROVIDER_ID,
          'https://accounts.google.com/gsi/client',
          () => {
            google.accounts.id.initialize({
              client_id: this.clientId,
              auto_select: autoLogin,
              callback: ({ credential }) =>
                this._socialUser.next(this.createSocialUser(credential)),
            });

            this._socialUser
              .pipe(filter((user) => user === null))
              .subscribe(() => google.accounts.id.prompt(console.debug));

            resolve();
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  getLoginStatus(refreshToken?: boolean): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (this._socialUser.value) {
        if (refreshToken) {
          google.accounts.id.revoke(this._socialUser.value.id, (response) => {
            if (response.error) {
              reject(response.error);
            }
            resolve(this._socialUser.value);
          });
        } else {
          resolve(this._socialUser.value);
        }
      } else {
        reject(
          `No user is currently logged in with ${GoogleLoginProvider.PROVIDER_ID}`
        );
      }
    });
  }

  async signOut(): Promise<void> {
    google.accounts.id.disableAutoSelect();
    this._socialUser.next(null);
  }

  private createSocialUser(idToken: string) {
    const user = new SocialUser();
    user.idToken = idToken;
    const payload = decodeJwt(idToken);
    user.id = payload.sub;
    user.name = payload.name as string | undefined;
    user.email = payload.email as string | undefined;
    user.photoUrl = payload.picture as string | undefined;
    user.firstName = payload['given_name'] as string | undefined;
    user.lastName = payload['family_name'] as string | undefined;
    return user;
  }
}
