import { Injectable, Inject } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { LoginProvider } from './entities/login-provider';
import { LoginOptions } from './entities/login-option';
import { SocialUser } from './entities/social-user';

export interface AuthServiceConfig {
  autoLogin?: boolean;
  providers: { id: string; provider: LoginProvider }[];
}

@Injectable()
export class AuthService {
  private static readonly ERR_LOGIN_PROVIDER_NOT_FOUND =
    'Login provider not found';
  private static readonly ERR_NOT_LOGGED_IN = 'Not logged in';
  private static readonly ERR_NOT_INITIALIZED = 'Login providers not ready yet';

  private providers: Map<string, LoginProvider> = new Map();
  private autoLogin = false;

  private _user: SocialUser = null;
  private _authState: ReplaySubject<SocialUser> = new ReplaySubject(1);

  private initialized = false;

  get authState(): Observable<SocialUser> {
    return this._authState.asObservable();
  }

  constructor(@Inject('AuthServiceConfig') config: AuthServiceConfig | Promise<AuthServiceConfig>) {
    if (config instanceof Promise) {
      config.then((config) => {
        this.initialize(config);
      });
    } else {
      this.initialize(config);
    }
  }

  private initialize(config: AuthServiceConfig) {
    this.autoLogin = config.autoLogin !== undefined ? config.autoLogin : false;

    config.providers.forEach((item) => {
      this.providers.set(item.id, item.provider);
    });

    Promise.all(
      Array.from(this.providers.values()).map((provider) =>
        provider.initialize()
      )
    ).then(() => {
      this.initialized = true;

      this.providers.forEach((provider: LoginProvider, key: string) => {
        if (this.autoLogin) {
          provider
            .getLoginStatus()
            .then((user: SocialUser) => {
              user.provider = key;

              this._user = user;
              this._authState.next(user);
            })
            .catch(console.debug);
        }
      });
    });
  }

  signIn(providerId: string, opt?: LoginOptions): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(AuthService.ERR_NOT_INITIALIZED);
      } else {
        let providerObject = this.providers.get(providerId);
        if (providerObject) {
          providerObject
            .signIn(opt)
            .then((user: SocialUser) => {
              user.provider = providerId;
              resolve(user);

              this._user = user;
              this._authState.next(user);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(AuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }

  signOut(revoke: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(AuthService.ERR_NOT_INITIALIZED);
      } else if (!this._user) {
        reject(AuthService.ERR_NOT_LOGGED_IN);
      } else {
        let providerId = this._user.provider;
        let providerObject = this.providers.get(providerId);
        if (providerObject) {
          providerObject
            .signOut(revoke)
            .then(() => {
              resolve();

              this._user = null;
              this._authState.next(null);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(AuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }
}
