import {LoginOpt, SocialUser} from 'angularx-social-login';

export class DummyLoginProvider extends BaseLoginProvider {

    public static readonly PROVIDER_ID: string = 'DUMMY';

    static readonly DEFAULT_USER = {
        id: '1234567890',
        name: 'Mickey Mouse',
        email: 'mickey@mouse.com',
        firstName: 'Mickey',
        lastName: 'Mouse',
        authToken: 'dummyAuthToken',
        photoUrl: 'https://en.wikipedia.org/wiki/File:Mickey_Mouse.png',
        provider: 'DUMMY',
        idToken: 'dummyIdToken',
        authorizationCode: 'dummyAuthCode'
    };

    private dummy: SocialUser;

    constructor(dummy?: SocialUser) {
        super();
        if (dummy) {
            this.dummy = dummy;
        } else {
            this.dummy = DummyLoginProvider.DEFAULT_USER;
        }
    }

    getLoginStatus(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                    resolve(this.dummy);
            });
        });
    }

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._readyState.next(true);
            resolve();
        });
    }

    signIn(opt ?: LoginOpt): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                resolve(this.dummy);
            });
        });
    }

    signOut(revoke ?: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                resolve();
            });
        });
    }
}
