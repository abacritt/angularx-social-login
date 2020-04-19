import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/user';
import { LoginOpt } from '../auth.service';

declare let AppleID: any;

export class AppleLoginProvider extends BaseLoginProvider {

    public static readonly PROVIDER_ID: string = 'APPLE';

    protected auth2: any;

    constructor(private clientId: string, private scope: string, private redirectURI: string) { super(); }

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loadScript(AppleLoginProvider.PROVIDER_ID,
                'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
                () => {
                        this.auth2 = AppleID.auth.init({
                            clientId : this.clientId,
                            scope : this.scope,
                            redirectURI: this.redirectURI
                        });
                });
        });
    }

    signIn(opt?: LoginOpt): Promise<SocialUser> {
        console.log("AppleCall Signin");
        return new Promise((resolve, reject) => {
                let promise = AppleID.auth.signIn();
                promise.then((err: any) => {
                    reject(err);
                });
        });
    }
getLoginStatus(): Promise<SocialUser> {
        return null;
    }
signOut(revoke?: boolean): Promise<any> {
        return null;
    }
}
