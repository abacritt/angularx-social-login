import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';
import { LoginProvider } from '../entities/login-provider';
import { decodeJwt } from 'jose';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, filter, skip, Subject, take } from 'rxjs';

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
  private readonly _socialUser = new BehaviorSubject<SocialUser | null>(null);
  private readonly _accessToken = new Subject<string>();
  private _tokenClient: google.accounts.oauth2.TokenClient | undefined;
  public static readonly PROVIDER_ID: string = 'GOOGLE';
  public readonly changeUser = new EventEmitter<SocialUser | null>();

  constructor(
    private clientId: string,
    private readonly initOptions?: GoogleInitOptions
  ) {
    super();

    this.initOptions = { ...defaultInitOptions, ...this.initOptions };

    // emit changeUser events but skip initial value from behaviorSubject
    this._socialUser.pipe(skip(1)).subscribe(this.changeUser);
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

                if (this.initOptions.scopes) {
                  const scopes =
                    this.initOptions.scopes instanceof Array
                      ? this.initOptions.scopes
                      : this.initOptions.scopes
                          .split(/ +|\r?\n/)
                          .filter((p) => p);

                  this._tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.clientId,
                    scope: scopes.join(' '),
                    hint: socialUser.email,
                    callback: (tokenResponse) => {
                      if (tokenResponse.error) {
                        const errorObj = {
                          code: tokenResponse.error,
                          description: tokenResponse.error_description,
                          uri: tokenResponse.error_uri,
                        };
                        this._accessToken.error(errorObj);
                      } else {
                        this._accessToken.next(tokenResponse.access_token);
                      }
                    },
                  });
                }
              },
            });

            if (this.initOptions.oneTapEnabled) {
              this._socialUser
                .pipe(filter((user) => user === null))
                .subscribe(() => google.accounts.id.prompt(console.debug));
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
        reject('No token client was instantiated.');
      } else {
        this._tokenClient.requestAccessToken();
        this._accessToken.pipe(take(1)).subscribe(resolve);
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
