import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/user';
import { LoginOpt } from '../auth.service';

declare let IN: any;

export class LinkedInLoginProvider extends BaseLoginProvider {

    public static readonly PROVIDER_ID: string = 'LINKEDIN';

    constructor(
        private clientId: string,
        private authorize?: boolean,
        private lang?: string,
        private fields: string = 'id,first-name,last-name,email-address,picture-url'
    ) {
        super();
    }

    initialize(): Promise<void> {
        let inner_text = '';

        inner_text += 'api_key: ' + this.clientId + '\r\n';
        inner_text += 'authorize:' + (this.authorize ? 'true' : 'false') + '\r\n';
        inner_text += 'lang: ' + (this.lang ? this.lang : 'fr_FR') + '\r\n';

        return new Promise((resolve, reject) => {
            this.loadScript(LinkedInLoginProvider.PROVIDER_ID,
                '//platform.linkedin.com/in.js',
                () => {
                    let that = this;
                    setTimeout(() => {
                        this._readyState.next(true);
                        resolve();
                    }, 800);
                }, false, inner_text);
        });
    }

    getLoginStatus(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                if (IN.User.isAuthorized()) {
                    IN.API.Raw(`/people/~:(${this.fields})`).result((res: any) => {
                        let user: SocialUser = new SocialUser();
                        user.id = res.id;
                        user.name = res.firstName + ' ' + res.lastName;
                        user.email = res.emailAddress;
                        user.photoUrl = res.pictureUrl;
                        user.firstName = res.firstName;
                        user.lastName = res.lastName;
                        user.authToken = IN.ENV.auth.oauth_token;
                        user.linkedIn = res;

                        resolve(user);
                    });
                } else {
                    reject('No user is currently logged in.');
                }
            });
        });
    }

    signIn(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                IN.User.authorize(() => {
                    IN.API.Raw(`/people/~:(${this.fields})`).result((res: any) => {
                        let user: SocialUser = new SocialUser();
                        user.id = res.id;
                        user.name = res.firstName + ' ' + res.lastName;
                        user.email = res.emailAddress;
                        user.photoUrl = res.pictureUrl;
                        user.firstName = res.firstName;
                        user.lastName = res.lastName;
                        user.authToken = IN.ENV.auth.oauth_token;

                        user.linkedIn = res;

                        resolve(user);
                    });
                });
            });
        });
    }

    signOut(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                IN.User.logout(() => {
                    resolve();
                }, {});
            });
        });
    }
}
