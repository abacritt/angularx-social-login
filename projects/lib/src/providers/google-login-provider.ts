import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';
import { LoginProvider } from '../entities/login-provider';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, filter, skip, take } from 'rxjs';

export interface GoogleInitOptions {
  /**
   * enables the One Tap mechanism, and makes auto-login possible
   */
  oneTapEnabled?: boolean;
  /**
   * list of permission scopes to grant in case we request an access token
   */
  scopes?: string | string[];
}

const defaultInitOptions: GoogleInitOptions = {
  oneTapEnabled: true,
};

export class GoogleLoginProvider
  extends BaseLoginProvider
  implements LoginProvider
{
  public static readonly PROVIDER_ID: string = 'GOOGLE';

  public readonly changeUser = new EventEmitter<SocialUser | null>();

  private readonly _socialUser = new BehaviorSubject<SocialUser | null>(null);
  private readonly _accessToken = new BehaviorSubject<string | null>(null);
  private readonly _receivedAccessToken = new EventEmitter<string>();
  private _tokenClient: google.accounts.oauth2.TokenClient | undefined;

  constructor(
    private clientId: string,
    private readonly initOptions?: GoogleInitOptions
  ) {
    super();

    this.initOptions = { ...defaultInitOptions, ...this.initOptions };

    // emit changeUser events but skip initial value from behaviorSubject
    this._socialUser.pipe(skip(1)).subscribe(this.changeUser);

    // emit receivedAccessToken but skip initial value from behaviorSubject
    this._accessToken.pipe(skip(1)).subscribe(this._receivedAccessToken);
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
                const socialUser = this.createSocialUser(credential);
                this._socialUser.next(socialUser);
              },
            });

            if (this.initOptions.oneTapEnabled) {
              this._socialUser
                .pipe(filter((user) => user === null))
                .subscribe(() => google.accounts.id.prompt(console.debug));
            }

            if (this.initOptions.scopes) {
              const scope =
                this.initOptions.scopes instanceof Array
                  ? this.initOptions.scopes.filter((s) => s).join(' ')
                  : this.initOptions.scopes;

              this._tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.clientId,
                scope,
                callback: (tokenResponse) => {
                  if (tokenResponse.error) {
                    this._accessToken.error({
                      code: tokenResponse.error,
                      description: tokenResponse.error_description,
                      uri: tokenResponse.error_uri,
                    });
                  } else {
                    this._accessToken.next(tokenResponse.access_token);
                  }
                },
              });
            }

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

  getAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._tokenClient) {
        if (this._socialUser.value) {
          reject(
            'No token client was instantiated, you should specify some scopes.'
          );
        } else {
          reject('You should be logged-in first.');
        }
      } else {
        this._tokenClient.requestAccessToken({
          hint: this._socialUser.value?.email,
        });
        this._receivedAccessToken.pipe(take(1)).subscribe(resolve);
      }
    });
  }

  revokeAccessToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._tokenClient) {
        reject(
          'No token client was instantiated, you should specify some scopes.'
        );
      } else if (!this._accessToken.value) {
        reject('No access token to revoke');
      } else {
        google.accounts.oauth2.revoke(this._accessToken.value, () => {
          this._accessToken.next(null);
          resolve();
        });
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
    const payload = this.decodeJwt(idToken);
    user.id = payload.sub;
    user.name = payload.name;
    user.email = payload.email;
    user.photoUrl = payload.picture;
    user.firstName = payload['given_name'];
    user.lastName = payload['family_name'];
    return user;
  }

  private decodeJwt(idToken: string): Record<string, string | undefined> {
    return JSON.parse(window.atob(idToken.split('.')[1]));
  }
}
