
import {BaseLoginProvider} from '../entities/base-login-provider';
import {SocialUser} from '../entities/user';
import {LoginOpt} from '../auth.service';

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

    private loggedIn: boolean;

    constructor(dummy?: SocialUser) {
        super();
        if (dummy) {
            this.dummy = dummy;
        } else {
            this.dummy = DummyLoginProvider.DEFAULT_USER;
        }

        // Start not logged in
        this.loggedIn = false;
    }

    getLoginStatus(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {

                if (this.loggedIn) {
                    resolve(this.dummy);
                } else {
                    reject('No user is currently logged in.');
                }
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
                this.loggedIn = true;
                resolve(this.dummy);
            });
        });
    }

    signOut(revoke ?: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this.onReady().then(() => {
                this.loggedIn = false;
                resolve();
            });
        });
    }
}
