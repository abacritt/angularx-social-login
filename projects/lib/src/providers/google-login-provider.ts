import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';
import { LoginProvider } from '../entities/login-provider';
import { decodeJwt } from 'jose';
import { EventEmitter } from '@angular/core';

export class GoogleLoginProvider
  extends BaseLoginProvider
  implements LoginProvider
{
  public static readonly PROVIDER_ID: string = 'GOOGLE';
  public readonly signedIn = new EventEmitter<SocialUser>();

  private _socialUser: SocialUser | null = null;

  constructor(private clientId: string) {
    super();
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
              callback: ({ credential }) => {
                this._socialUser = this.createSocialUser(credential);
                this.signedIn.emit(this._socialUser);
              },
            });

            google.accounts.id.prompt(console.debug);

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
      if (this._socialUser) {
        // TODO try get from local storage ?
        if (refreshToken) {
          google.accounts.id.revoke(this._socialUser.id, (response) => {
            if (response.error) {
              reject(response.error);
            }
            resolve(this._socialUser);
          });
        } else {
          resolve(this._socialUser);
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
    google.accounts.id.prompt(console.debug);
    this._socialUser = null;
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
