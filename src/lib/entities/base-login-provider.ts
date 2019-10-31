import { LoginProvider } from './login-provider';
import { SocialUser } from './user';
import { BehaviorSubject } from 'rxjs';
import {isPlatformBrowser} from '@angular/common';
import {Inject, PLATFORM_ID} from '@angular/core';

export abstract class BaseLoginProvider implements LoginProvider {

    protected _readyState: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(@Inject(PLATFORM_ID) private platformId: Object,) { }

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

    loadScript(id: string, src: string, onload: any, async = true, inner_text_content = ''): void {
        // get document if platform is only browser
        if (isPlatformBrowser(this.platformId) && document && !document.getElementById(id)) {
            let signInJS = document.createElement('script');
            signInJS.async = async;
            signInJS.src = src;
            signInJS.onload = onload;

            if (inner_text_content) // LinkedIn
                signInJS.text = inner_text_content;

            document.head.appendChild(signInJS);
        }
    }
}
