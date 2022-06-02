import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';
import { decodeJwt } from 'jose';
import { EventEmitter } from '@angular/core';
import { LoginProvider } from '../entities/login-provider';

export class GoogleLoginProvider
  extends BaseLoginProvider
  implements LoginProvider
{
  public static readonly PROVIDER_ID: string = 'GOOGLE';
  public readonly signedIn = new EventEmitter<SocialUser>(true);

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
              callback: ({ credential }) =>
                this.signedIn.emit(this.createSocialUser(credential)),
            });

            google.accounts.id.prompt(this.onOneTapEvent);

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
      // TODO try get from local storage ?
      reject(
        `No user is currently logged in with ${GoogleLoginProvider.PROVIDER_ID}`
      );
    });
  }

  signOut(): Promise<void> {
    return new Promise((resolve) => {
      google.accounts.id.prompt(this.onOneTapEvent);
      resolve();
    });
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

  private onOneTapEvent(event: google.accounts.id.PromptMomentNotification) {
    console.debug('handleOneTapPromptNotification(notification)', event);
  }
}
