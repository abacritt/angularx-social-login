import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, skip, take } from 'rxjs/operators';

export interface GoogleInitOptions {
  /**
   * enables the One Tap mechanism, and makes auto-login possible
   */
  oneTapEnabled?: boolean;
  /**
   * list of permission scopes to grant in case we request an access token
   */
  scopes?: string | string[];
 /**
   * This attribute sets the DOM ID of the container element. If it's not set, the One Tap prompt is displayed in the top-right corner of the window.
   */
  prompt_parent_id?: string;

  /**
   * Optional, defaults to 'select_account'.
   * A space-delimited, case-sensitive list of prompts to present the
   * user.
   * Possible values are:
   * empty string The user will be prompted only the first time your
   *     app requests access. Cannot be specified with other values.
   * 'none' Do not display any authentication or consent screens. Must
   *     not be specified with other values.
   * 'consent' Prompt the user for consent.
   * 'select_account' Prompt the user to select an account.
   */
  prompt? : '' | 'none' | 'consent' | 'select_account';
}

const defaultInitOptions: GoogleInitOptions = {
  oneTapEnabled: true,
};

export class GoogleLoginProvider extends BaseLoginProvider {
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
              callback: async ({ credential }) => {
                const socialUser = this.createSocialUser(credential);
                socialUser.authToken = await this.getAccessToken(socialUser);
                this._socialUser.next(socialUser);
              },
              prompt_parent_id: this.initOptions?.prompt_parent_id,
              itp_support: this.initOptions.oneTapEnabled
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
                prompt : this.initOptions.prompt,
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

  getLoginStatus(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (this._socialUser.value) {
        resolve(this._socialUser.value);
      } else {
        reject(
          `No user is currently logged in with ${GoogleLoginProvider.PROVIDER_ID}`
        );
      }
    });
  }

  refreshToken(): Promise<SocialUser | null> {
    return new Promise((resolve, reject) => {
      google.accounts.id.revoke(this._socialUser.value.id, (response) => {
        if (response.error) reject(response.error);
        else resolve(this._socialUser.value);
      });
    });
  }

  getAccessToken(socialUser?: SocialUser ): Promise<string> {
    socialUser ||= this._socialUser.value;
    const scope =
      this.initOptions.scopes instanceof Array ?
        this.initOptions.scopes.filter((s) => s).join(' ') :
        (this.initOptions.scopes || 'email profile');

    if (!socialUser) {
      this._tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope,
        hint: socialUser?.email,
        prompt : socialUser?.email? '' : this.initOptions.prompt,
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

    return new Promise((resolve, reject) => {
      if (!this._tokenClient) {
        if (socialUser) {
          reject(
            'No token client was instantiated, you should specify some scopes.'
          );
        } else {
          reject('You should be logged-in first.');
        }
      } else {
        this._tokenClient.requestAccessToken({
          hint: socialUser?.email,
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

  signIn(): Promise<SocialUser> {
    return Promise.reject(
      'You should not call this method directly for Google, use "<asl-google-signin-button>" wrapper ' +
        'or generate the button yourself with "google.accounts.id.renderButton()" ' +
        '(https://developers.google.com/identity/gsi/web/guides/display-button#javascript)'
    );
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
    const base64Url = idToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  }
}
