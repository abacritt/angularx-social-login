import { Inject, Injectable } from '@angular/core';
import { AsyncSubject, Observable, ReplaySubject } from 'rxjs';
import { LoginProvider } from './entities/login-provider';
import { SocialUser } from './entities/social-user';
import { GoogleLoginProvider } from './providers/google-login-provider';

/**
 * An interface to define the shape of the service configuration options.
 */
export interface SocialAuthServiceConfig {
  autoLogin?: boolean;
  providers: { id: string; provider: LoginProvider }[];
  onError?: (error: any) => any;
}

/**
 * The service encapsulating the social login functionality. Exposes methods like
 * `signIn`, `signOut`. Also, exposes an `authState` `Observable` that one can
 * subscribe to get the current logged in user information.
 *
 * @dynamic
 */
@Injectable()
export class SocialAuthService {
  private static readonly ERR_LOGIN_PROVIDER_NOT_FOUND =
    'Login provider not found';
  private static readonly ERR_NOT_LOGGED_IN = 'Not logged in';
  private static readonly ERR_NOT_INITIALIZED =
    'Login providers not ready yet. Are there errors on your console?';
  private static readonly ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN =
    'Chosen login provider is not supported for refreshing a token';

  private providers: Map<string, LoginProvider> = new Map();
  private autoLogin = false;

  private _user: SocialUser = null;
  private _authState: ReplaySubject<SocialUser> = new ReplaySubject(1);

  /* Consider making this an enum comprising LOADING, LOADED, FAILED etc. */
  private initialized = false;
  private _initState: AsyncSubject<boolean> = new AsyncSubject();

  /** An `Observable` that one can subscribe to get the current logged in user information */
  get authState(): Observable<SocialUser> {
    return this._authState.asObservable();
  }

  /** An `Observable` to communicate the readiness of the service and associated login providers */
  get initState(): Observable<boolean> {
    return this._initState.asObservable();
  }

  /**
   * @param config A `SocialAuthServiceConfig` object or a `Promise` that resolves to a `SocialAuthServiceConfig` object
   */
  constructor(
    @Inject('SocialAuthServiceConfig')
    config: SocialAuthServiceConfig | Promise<SocialAuthServiceConfig>
  ) {
    if (config instanceof Promise) {
      config.then((config) => {
        this.initialize(config);
      });
    } else {
      this.initialize(config);
    }
  }

  private initialize(config: SocialAuthServiceConfig) {
    this.autoLogin = config.autoLogin !== undefined ? config.autoLogin : false;
    const { onError = console.error } = config;

    config.providers.forEach((item) => {
      this.providers.set(item.id, item.provider);
    });

    Promise.all(
      Array.from(this.providers.values()).map((provider) =>
        provider.initialize()
      )
    )
      .then(() => {
        if (this.autoLogin) {
          const loginStatusPromises = [];
          let loggedIn = false;

          this.providers.forEach((provider: LoginProvider, key: string) => {
            let promise = provider.getLoginStatus();
            loginStatusPromises.push(promise);
            promise
              .then((user: SocialUser) => {
                user.provider = key;

                this._user = user;
                this._authState.next(user);
                loggedIn = true;
              })
              .catch(console.debug);
          });
          Promise.all(loginStatusPromises).catch(() => {
            if (!loggedIn) {
              this._user = null;
              this._authState.next(null);
            }
          });
        }
      })
      .catch((error) => {
        onError(error);
      })
      .finally(() => {
        this.initialized = true;
        this._initState.next(this.initialized);
        this._initState.complete();
      });
  }

  refreshAuthToken(providerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(SocialAuthService.ERR_NOT_INITIALIZED);
      } else if (providerId !== GoogleLoginProvider.PROVIDER_ID) {
        reject(SocialAuthService.ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN);
      } else {
        const providerObject = this.providers.get(providerId);
        if (providerObject) {
          providerObject
            .getLoginStatus({ refreshToken: true })
            .then((user: SocialUser) => {
              user.provider = providerId;
              this._user = user;
              this._authState.next(user);
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }

  /**
   * A method used to sign in a user with a specific `LoginProvider`.
   *
   * @param providerId Id with which the `LoginProvider` has been registered with the service
   * @param signInOptions Optional `LoginProvider` specific arguments
   * @returns A `Promise` that resolves to the authenticated user information
   */
  signIn(providerId: string, signInOptions?: any): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(SocialAuthService.ERR_NOT_INITIALIZED);
      } else {
        let providerObject = this.providers.get(providerId);
        if (providerObject) {
          providerObject
            .signIn(signInOptions)
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
          reject(SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }

  /**
   * A method used to sign out the currently loggen in user.
   *
   * @param revoke Optional parameter to specify whether a hard sign out is to be performed
   * @returns A `Promise` that resolves if the operation is successful, rejects otherwise
   */
  signOut(revoke: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(SocialAuthService.ERR_NOT_INITIALIZED);
      } else if (!this._user) {
        reject(SocialAuthService.ERR_NOT_LOGGED_IN);
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
          reject(SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }
}
