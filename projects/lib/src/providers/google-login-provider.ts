import { NgZone } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, ReplaySubject } from 'rxjs';
import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';

export class GoogleLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID: string = 'GOOGLE';
	public readonly initialized$: Observable<true>;
  public readonly socialUser$: Observable<SocialUser>;

  protected auth2: gapi.auth2.GoogleAuth;

  private readonly _credentialResponse = new BehaviorSubject<google.accounts.id.CredentialResponse | null>(null);
  private readonly _initialized$ = new ReplaySubject<true>(1);
  private _accessToken = '';

  constructor(
    private clientId: string,
    private readonly _ngZone: NgZone,
    private initOptions: any = { scope: 'email' }
  ) {
    super();
    this.initialized$ = this._initialized$.asObservable();
    this.socialUser$ = this._credentialResponse.pipe(
      filter(resp => resp !== null),
      map(resp => {
        const user = new SocialUser();
        user.idToken = resp.credential;
        return user;
      })
    );
  }

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(
          GoogleLoginProvider.PROVIDER_ID,
          'https://accounts.google.com/gsi/client',
          () => {            
            google.accounts.id.initialize({
              client_id: this.clientId,
              callback: response => {
                this._ngZone.run(() => this._credentialResponse.next(response));
              },
            });

            this._initialized$.next(true);
            
            google.accounts.id.prompt(notification => console.debug('notification', notification));

            resolve();
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  getLoginStatus(loginStatusOptions?: any): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (this._credentialResponse.value !== null) {
        const user = new SocialUser();
        user.idToken = this._credentialResponse.value.credential;
        resolve(user);
      }
      else {
        reject(
          `No user is currently logged in with ${GoogleLoginProvider.PROVIDER_ID}`
        );
      }
    });

    const options = {...this.initOptions, ...loginStatusOptions};

    return new Promise((resolve, reject) => {
      if (this.auth2.isSignedIn.get()) {
        const user: SocialUser = new SocialUser();

        const profile = this.auth2.currentUser.get().getBasicProfile();
        const authResponse = this.auth2.currentUser.get().getAuthResponse(true);  // get complete authResponse object
        this.setUserProfile(user, profile);
        user.response = authResponse;

        const resolveUser = authenticationResponse => {
          user.authToken = authenticationResponse.access_token;
          user.idToken = authenticationResponse.id_token;

          resolve(user);
        };

        if (options.refreshToken) {
          this.auth2.currentUser.get().reloadAuthResponse().then(resolveUser);
        } else {
          resolveUser(authResponse);
        }
      } else {
        reject(
          `No user is currently logged in with ${GoogleLoginProvider.PROVIDER_ID}`
        );
      }
    });
  }

  signIn(signInOptions?: any): Promise<SocialUser> {
    throw new Error('not implemented');
    
    const options = { ...this.initOptions, ...signInOptions };

    return new Promise((resolve, reject) => {
      const offlineAccess: boolean = options && options.offline_access;
      const promise = !offlineAccess
        ? this.auth2.signIn(signInOptions)
        : this.auth2.grantOfflineAccess(signInOptions);

      promise
        .then(
          (response: any) => {
            const user: SocialUser = new SocialUser();

            if (response && response.code) {
              user.authorizationCode = response.code;
            } else {
              const profile = this.auth2.currentUser.get().getBasicProfile();
              const authResponse = this.auth2.currentUser.get().getAuthResponse(true);

              const token = authResponse.access_token;
              const backendToken = authResponse.id_token;

              this.setUserProfile(user, profile);
              user.authToken = token;
              user.idToken = backendToken;

              user.response = authResponse;
            }

            resolve(user);
          },
          (closed: any) => {
            reject(closed);
          }
        )
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  signOut(revoke?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const promptAndResolve = () => {
        google.accounts.id.prompt(notification => console.debug('notification', notification));
        resolve()
      };

      if (revoke) {
        google.accounts.oauth2.revoke(this._accessToken, promptAndResolve);
      }
      else {
        promptAndResolve();
      }
    });

    return new Promise((resolve, reject) => {
      let signOutPromise: Promise<any>;

      if (revoke) {
        signOutPromise = this.auth2.disconnect();
      } else {
        signOutPromise = this.auth2.signOut();
      }

      signOutPromise
        .then((err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  private setUserProfile(user: SocialUser, profile: any): void {
    user.id = profile.getId();
    user.name = profile.getName();
    user.email = profile.getEmail();
    user.photoUrl = profile.getImageUrl();
    user.firstName = profile.getGivenName();
    user.lastName = profile.getFamilyName();
  }
}
