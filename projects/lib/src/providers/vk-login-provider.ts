import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';

declare let VK: any;

export class VKLoginProvider extends BaseLoginProvider {
  constructor(
    private clientId: string,
    private initOptions: any = {
      fields: 'photo_max,contacts',
      version: '5.124',
    }
  ) {
    super();
  }

  public static readonly PROVIDER_ID: string = 'VK';

  private readonly VK_API_URL = '//vk.com/js/api/openapi.js';
  private readonly VK_API_GET_USER = 'users.get';

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(
          VKLoginProvider.PROVIDER_ID,
          this.VK_API_URL,
          () => {
            VK.init({
              apiId: this.clientId,
            });

            resolve();
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  getLoginStatus(): Promise<SocialUser> {
    return new Promise<SocialUser>((resolve: any, reject: any) =>
      this.getLoginStatusInternal(resolve, reject)
    );
  }

  signIn(): Promise<SocialUser> {
    return new Promise<SocialUser>((resolve: any, reject: any) =>
      this.signInInternal(resolve, reject)
    );
  }

  signOut(): Promise<void> {
    return new Promise((resolve, reject) => {
      VK.Auth.logout((response: any) => {
        resolve();
      });
    });
  }

  private signInInternal(resolve: any, reject: any) {
    VK.Auth.login((loginResponse: any) => {
      if (loginResponse.status === 'connected') {
        this.getUser(
          loginResponse.session.mid,
          loginResponse.session.sid,
          resolve
        );
      }
    });
  }

  private getUser(userId: any, token: any, resolve: any) {
    VK.Api.call(
      this.VK_API_GET_USER,
      {
        user_id: userId,
        fields: this.initOptions.fields,
        v: this.initOptions.version,
      },
      (userResponse: any) => {
        resolve(
          this.createUser(
            Object.assign({}, { token }, userResponse.response[0])
          )
        );
      }
    );
  }

  private getLoginStatusInternal(resolve: any, reject: any) {
    VK.Auth.getLoginStatus((loginResponse: any) => {
      if (loginResponse.status === 'connected') {
        this.getUser(
          loginResponse.session.mid,
          loginResponse.session.sid,
          resolve
        );
      }
    });
  }

  private createUser(response: any): SocialUser {
    const user: SocialUser = new SocialUser();
    user.id = response.id;
    user.name = `${response.first_name} ${response.last_name}`;
    user.photoUrl = response.photo_max;
    user.authToken = response.token;
    return user;
  }
}
