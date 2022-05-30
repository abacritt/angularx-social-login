import { map, Observable, ReplaySubject } from 'rxjs';
import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';
import { decodeJwt, JWTPayload } from 'jose';

export class GoogleLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID: string = 'GOOGLE';
  public readonly observe = true;

  private readonly _credentialResponse = new ReplaySubject<google.accounts.id.CredentialResponse>(1);
  private _accessToken = '';

  constructor(private clientId: string) {
    super();
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
                this._credentialResponse.next(response)
              },
            });
            
            google.accounts.id.prompt(notification => console.debug('notification', notification));

            resolve();
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  getLoginStatus(loginStatusOptions?: { refreshToken: true }): Observable<SocialUser> {
    if (loginStatusOptions?.refreshToken) {
      // TODO
      debugger;
    }

    return this._credentialResponse.pipe(
      map(({ credential }) => {
        const user = new SocialUser();
        user.idToken = credential;
        const jwtPayload = decodeJwt(credential);
        this.setUserProfile(user, jwtPayload);
        return user;
      }),
    );
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
