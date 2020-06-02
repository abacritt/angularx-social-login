import { LoginProvider } from './login-provider';
import { SocialUser } from './social-user';
import { BehaviorSubject } from 'rxjs';

export abstract class BaseLoginProvider implements LoginProvider {

    protected _readyState: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor() { }

    protected onReady(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._readyState.subscribe((isReady: boolean) => {
                if (isReady) {
                    resolve();
                }
            })
        });
    }

    abstract initialize(): Promise<void>;
    abstract getLoginStatus(): Promise<SocialUser>;
    abstract signIn(): Promise<SocialUser>;
    abstract signOut(revoke?: boolean): Promise<any>;

    protected loadScript(id: string, src: string, onload: any, parentElement = null): void {
        // get document if platform is only browser
        if (typeof document !== 'undefined' && !document.getElementById(id)) {
            let signInJS = document.createElement('script');

            signInJS.async = true;
            signInJS.src = src;
            signInJS.onload = onload;

            if (!parentElement) {
                parentElement = document.head;
            }

            parentElement.appendChild(signInJS);
        }
    }
}
