import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';

/**
 * Protocol modes supported by MSAL.
 */
export enum ProtocolMode {
  AAD = 'AAD',
  OIDC = 'OIDC'
}

/**
 * Initialization Options for Microsoft Provider: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md
 * Details (not all options are supported): https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export type MicrosoftOptions = {
  redirect_uri?: string,
  logout_redirect_uri?: string,
  authority?: string,
  knownAuthorities?: string[],
  protocolMode?: ProtocolMode,
  clientCapabilities?: string[],
  cacheLocation?: string,
  scopes?: string[],
  prompt?: string,
};

// Collection of internal MSAL interfaces from: https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser/src

interface MSALAccount {
  environment: string;
  homeAccountId: string;
  tenantId: string;
  username: string;
}

interface MSGraphUserInfo {
  businessPhones: string[];
  displayName: string;
  givenName: string;
  id: string;
  jobTitle: string;
  mail: string;
  mobilePhone: string;
  officeLocation: string;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
}

interface MSALLoginRequest {
  scopes?: string[];
  sid?: string;
  loginHint?: string;
  domainHint?: string;
  prompt?: string;
}

interface MSALLoginResponse {
  accessToken: string;
  account: MSALAccount;
  expiresOn: Date;
  extExpiresOn: Date;
  familyId: string;
  fromCache: boolean;
  idToken: string;
  idTokenClaims: any;
  scopes: string[];
  state: string;
  tenantId: string;
  uniqueId: string;
}

interface MSALLogoutRequest {
  account?: MSALAccount;
  postLogoutRedirectUri?: string;
  authority?: string;
  correlationId?: string;
}

interface MSALClientApplication {
  getAllAccounts(): MSALAccount[];
  logoutPopup(logoutRequest?: MSALLogoutRequest): Promise<void>;
  loginPopup(loginRequest: MSALLoginRequest): Promise<MSALLoginResponse>;
  ssoSilent(loginRequest: MSALLoginRequest): Promise<MSALLoginResponse>;
  acquireTokenSilent(loginRequest: MSALLoginRequest): Promise<MSALLoginResponse>;
  getAccountByHomeId(homeAccountId: string): MSALAccount;
}

declare let msal: any;

const COMMON_AUTHORITY: string = 'https://login.microsoftonline.com/common/';

/**
 * Microsoft Authentication using MSAL v2: https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser
 */
export class MicrosoftLoginProvider extends BaseLoginProvider {
  private _instance: MSALClientApplication;
  public static readonly PROVIDER_ID: string = 'MICROSOFT';

  private initOptions: MicrosoftOptions = {
    authority: COMMON_AUTHORITY,
    scopes: ['openid', 'email', 'profile', 'User.Read'],
    knownAuthorities: [],
    protocolMode: ProtocolMode.AAD,
    clientCapabilities: [],
    cacheLocation: 'sessionStorage'
  };

  constructor(
    private clientId: string,
    initOptions?: MicrosoftOptions
  ) {
    super();

    this.initOptions = {
      ...this.initOptions,
      ...initOptions
    };
  }

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadScript(
        MicrosoftLoginProvider.PROVIDER_ID,
        'https://alcdn.msauth.net/browser/2.13.1/js/msal-browser.min.js',
        () => {
          try {
            const config = {
              auth: {
                clientId: this.clientId,
                redirectUri: this.initOptions.redirect_uri ?? location.origin,
                authority: this.initOptions.authority,
                knownAuthorities: this.initOptions.knownAuthorities,
                protocolMode: this.initOptions.protocolMode,
                clientCapabilities: this.initOptions.clientCapabilities
              },
              cache: !this.initOptions.cacheLocation ? null : {
                cacheLocation: this.initOptions.cacheLocation
              }
            };

            this._instance = new msal.PublicClientApplication(config);
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }

  private getSocialUser(loginResponse): Promise<SocialUser> {
    return new Promise<SocialUser>((resolve, reject) => {
      //After login, use Microsoft Graph API to get user info
      let meRequest = new XMLHttpRequest();
      meRequest.onreadystatechange = () => {
        if (meRequest.readyState == 4) {
          try {
            if (meRequest.status == 200) {
              let userInfo = <MSGraphUserInfo>JSON.parse(meRequest.responseText);

              let user: SocialUser = new SocialUser();
              user.provider = MicrosoftLoginProvider.PROVIDER_ID;
              user.id = loginResponse.idToken;
              user.authToken = loginResponse.accessToken;
              user.name = loginResponse.idTokenClaims.name;
              user.email = loginResponse.account.username;
              user.idToken = loginResponse.idToken;
              user.response = loginResponse;
              user.firstName = userInfo.givenName;
              user.lastName = userInfo.surname;

              resolve(user);
            } else {
              reject(`Error retrieving user info: ${meRequest.status}`);
            }
          } catch (err) {
            reject(err);
          }
        }
      };

      //Microsoft Graph ME Endpoint: https://docs.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
      meRequest.open('GET', 'https://graph.microsoft.com/v1.0/me');
      meRequest.setRequestHeader('Authorization', `Bearer ${loginResponse.accessToken}`);
      try {
        meRequest.send();
      } catch (err) {
        reject(err);
      }
    });
  }

  async getLoginStatus(): Promise<SocialUser> {
    const accounts = this._instance.getAllAccounts();
    if (accounts?.length > 0) {
      const loginResponse = await this._instance.ssoSilent({
        scopes: this.initOptions.scopes,
        loginHint: accounts[0].username
      });
      return await this.getSocialUser(loginResponse);
    } else {
      throw `No user is currently logged in with ${MicrosoftLoginProvider.PROVIDER_ID}`;
    }
  }

  async signIn(): Promise<SocialUser> {
    const loginResponse = await this._instance.loginPopup({
      scopes: this.initOptions.scopes,
      prompt: this.initOptions.prompt,
    });
    return await this.getSocialUser(loginResponse);
  }

  async signOut(revoke?: boolean): Promise<void> {
    const accounts = this._instance.getAllAccounts();
    if (accounts?.length > 0) {
      await this._instance.logoutPopup({
        account: accounts[0],
        postLogoutRedirectUri: this.initOptions.logout_redirect_uri ?? this.initOptions.redirect_uri ?? location.href
      })
    }
  }
}
