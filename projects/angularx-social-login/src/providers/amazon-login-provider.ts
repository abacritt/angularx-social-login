import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';

declare let amazon: any, window: any;

export class AmazonLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID: string = 'AMAZON';

  constructor(
    private clientId: string,
    private initOptions: any = {
      scope: 'profile',
      scope_data: {
        profile: { essential: false },
      },
      redirect_uri: location.origin,
    }
  ) {
    super();
  }

  initialize(): Promise<void> {
    let amazonRoot = null;
    if (document) {
      amazonRoot = document.createElement('div');
      amazonRoot.id = 'amazon-root';
      document.body.appendChild(amazonRoot);
    }

    window.onAmazonLoginReady = () => {
      amazon.Login.setClientId(this.clientId);
    };

    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore
        this.loadScript('amazon-login-sdk', 'https://assets.loginwithamazon.com/sdk/na/login1.js', () => {resolve();}, amazonRoot,
        () => {
          this.hasError = true;
          this.onHasErrorChange.emit(this.hasError);
          reject(`There was an issue loading the ${AmazonLoginProvider.PROVIDER_ID} authentication script.`);
        });
      } catch (err) {
        reject(err);
      } finally {
        this.isLoaded = true;
        this.onIsLoadedChange.emit(this.isLoaded);
      }
    });
  }

  getLoginStatus(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      let token = this.retrieveToken();

      if (token) {
        amazon.Login.retrieveProfile(token, (response: any) => {
          if (response.success) {
            let user: SocialUser = new SocialUser();

            user.id = response.profile.CustomerId;
            user.name = response.profile.Name;
            user.email = response.profile.PrimaryEmail;
            user.response = response.profile;

            resolve(user);
          } else {
            reject(response.error);
          }
        });
      } else {
        reject(`No user is currently logged in with ${AmazonLoginProvider.PROVIDER_ID}`);
      }
    });
  }

  signIn(signInOptions?: any): Promise<SocialUser> {
    const options = { ...this.initOptions, ...signInOptions };
    return new Promise((resolve, reject) => {
      amazon.Login.authorize(options, (authResponse: any) => {
        if (authResponse.error) {
          reject(authResponse.error);
        } else {
          amazon.Login.retrieveProfile(
            authResponse.access_token,
            (response: any) => {
              let user: SocialUser = new SocialUser();

              user.id = response.profile.CustomerId;
              user.name = response.profile.Name;
              user.email = response.profile.PrimaryEmail;
              user.authToken = authResponse.access_token;
              user.response = response.profile;

              this.persistToken(authResponse.access_token);

              resolve(user);
            }
          );
        }
      });
    });
  }

  signOut(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        amazon.Login.logout();

        this.clearToken();
        resolve();
      } catch (err: any) {
        reject(err.message);
      }
    });
  }

  private persistToken(token: string): void {
    localStorage.setItem(`${AmazonLoginProvider.PROVIDER_ID}_token`, token);
  }

  private retrieveToken(): string {
    return localStorage.getItem(`${AmazonLoginProvider.PROVIDER_ID}_token`) || '';
  }

  private clearToken(): void {
    localStorage.removeItem(`${AmazonLoginProvider.PROVIDER_ID}_token`);
  }
}
