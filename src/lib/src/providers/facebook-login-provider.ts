import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/user';
import { LoginOpt } from '../auth.service';

declare let FB: any;

export class FacebookLoginProvider extends BaseLoginProvider {

    public static readonly PROVIDER_ID = 'FACEBOOK';

    constructor(
        private clientId: string,
        private opt: LoginOpt = { scope: 'email,public_profile' },
        private locale: string = 'en_US',
        private fields: string = 'name,email,picture,first_name,last_name',
        private version: string = 'v2.9'
        private sdk: string = 'sdk'
    ) { super(); }

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loadScript(FacebookLoginProvider.PROVIDER_ID,
                `//connect.facebook.net/${this.locale}/${sdk}.js`,
                () => {
                    FB.init({
                        appId: this.clientId,
                        autoLogAppEvents: true,
                        cookie: true,
                        xfbml: true,
                        version: this.version
                    });
                    // FB.AppEvents.logPageView(); #FIX for #18

                    (function(d, s, id) {
                      var js, fjs = d.getElementsByTagName(s)[0];
                      if (d.getElementById(id)) return;
                      js = d.createElement(s); js.id = id;
                      js.src = "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js";
                      fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));

                    this._readyState.next(true);
                    resolve();
                });
        });
    }

    getLoginStatus(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                FB.getLoginStatus((response: any) => {
                    if (response.status === 'connected') {
                        let authResponse = response.authResponse;
                        FB.api(`/me?fields=${this.fields}`, (fbUser: any) => {
                            let user: SocialUser = new SocialUser();

                            user.id = fbUser.id;
                            user.name = fbUser.name;
                            user.email = fbUser.email;
                            user.photoUrl = 'https://graph.facebook.com/' + fbUser.id + '/picture?type=normal';
                            user.firstName = fbUser.first_name;
                            user.lastName = fbUser.last_name;
                            user.authToken = authResponse.accessToken;

                            user.facebook = fbUser;

                            resolve(user);
                        });
                    }
                });
            });
        });
    }

    signIn(opt?: LoginOpt): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                FB.login((response: any) => {
                    if (response.authResponse) {
                        let authResponse = response.authResponse;
                        FB.api(`/me?fields=${this.fields}`, (fbUser: any) => {
                            let user: SocialUser = new SocialUser();

                            user.id = fbUser.id;
                            user.name = fbUser.name;
                            user.email = fbUser.email;
                            user.photoUrl = 'https://graph.facebook.com/' + fbUser.id + '/picture?type=normal';
                            user.firstName = fbUser.first_name;
                            user.lastName = fbUser.last_name;
                            user.authToken = authResponse.accessToken;

                            user.facebook = fbUser;

                            resolve(user);
                        });
                    } else {
                        reject('User cancelled login or did not fully authorize.');
                    }
                }, this.opt);
            });
        });
    }

    signOut(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                FB.logout((response: any) => {
                    resolve();
                });
            });
        });
    }

}
