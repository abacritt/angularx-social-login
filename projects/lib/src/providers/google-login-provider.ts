import { NgZone } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, ReplaySubject } from 'rxjs';
import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';
import { decodeJwt, JWTPayload } from 'jose';

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
        const jwtPayload = decodeJwt(resp.credential);
        this.setUserProfile(user, jwtPayload);
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

  getLoginStatus(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (this._credentialResponse.value !== null) {
        const user = new SocialUser();
        user.idToken = this._credentialResponse.value.credential;
        const jwtPayload = decodeJwt(user.idToken);
        this.setUserProfile(user, jwtPayload);
        resolve(user);
      }
      else {
        reject(
          `No user is currently logged in with ${GoogleLoginProvider.PROVIDER_ID}`
        );
      }
    });
  }

  signIn(signInOptions?: any): Promise<SocialUser> {
    throw new Error('not implemented');
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
  }

  private setUserProfile(user: SocialUser, jwtPayload: JWTPayload) {
    user.id = jwtPayload.sub;
    user.name = jwtPayload['name'] as string;
    user.email = jwtPayload['email'] as string;
    user.photoUrl = jwtPayload['picture'] as string;
    user.firstName = jwtPayload['given_name'] as string;
    user.lastName = jwtPayload['family_name'] as string;
  }
}
