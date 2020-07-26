import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';

declare let gapi: any;

export class GoogleLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID: string = 'GOOGLE';

  protected auth2: any;

  constructor(
    private clientId: string,
    private initOptions: any = { scope: 'email' }
  ) {
    super();
  }

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadScript(
        GoogleLoginProvider.PROVIDER_ID,
        'https://apis.google.com/js/platform.js',
        () => {
          gapi.load('auth2', () => {
            this.auth2 = gapi.auth2.init({
              ...this.initOptions,
              client_id: this.clientId,
            });

            this.auth2
              .then(() => {
                resolve();
              })
              .catch((err: any) => {
                reject(err);
              });
          });
        }
      );
    });
  }

  getLoginStatus(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (this.auth2.isSignedIn.get()) {
        let user: SocialUser = new SocialUser();

        let profile = this.auth2.currentUser.get().getBasicProfile();
        let token = this.auth2.currentUser.get().getAuthResponse(true)
          .access_token;
        let backendToken = this.auth2.currentUser.get().getAuthResponse(true)
          .id_token;

        user.id = profile.getId();
        user.name = profile.getName();
        user.email = profile.getEmail();
        user.photoUrl = profile.getImageUrl();
        user.firstName = profile.getGivenName();
        user.lastName = profile.getFamilyName();
        user.authToken = token;
        user.idToken = backendToken;
        user.response = profile;

        resolve(user);
      } else {
        reject(`No user is currently logged in with ${GoogleLoginProvider.PROVIDER_ID}`);
      }
    });
  }

  signIn(signInOptions?: any): Promise<SocialUser> {
    const options = { ...this.initOptions, ...signInOptions };

    return new Promise((resolve, reject) => {
      const offlineAccess: boolean = options && options.offline_access;
      let promise = !offlineAccess
        ? this.auth2.signIn(signInOptions)
        : this.auth2.grantOfflineAccess(signInOptions);

      promise
        .then(
          (response: any) => {
            let user: SocialUser = new SocialUser();

            if (response && response.code) {
              user.authorizationCode = response.code;
            } else {
              let profile = this.auth2.currentUser.get().getBasicProfile();
              let token = this.auth2.currentUser.get().getAuthResponse(true)
                .access_token;
              let backendToken = this.auth2.currentUser
                .get()
                .getAuthResponse(true).id_token;

              user.id = profile.getId();
              user.name = profile.getName();
              user.email = profile.getEmail();
              user.photoUrl = profile.getImageUrl();
              user.firstName = profile.getGivenName();
              user.lastName = profile.getFamilyName();
              user.authToken = token;
              user.idToken = backendToken;

              user.response = profile;
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

  signOut(revoke?: boolean): Promise<any> {
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
}
