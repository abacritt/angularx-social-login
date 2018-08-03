import { LoginProvider } from './login-provider';
import { SocialUser } from './user';
import { Observable, BehaviorSubject } from 'rxjs';

export abstract class BaseLoginProvider implements LoginProvider {

	protected _readyState: BehaviorSubject<boolean> = new BehaviorSubject(false);

	constructor() { }

	protected onReady(): Promise<void> {
		return new Promise((resolve, reject) => {
			this._readyState.subscribe((isReady) => {
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
		if (document.getElementById(id)) { return; }

		let signInJS = document.createElement('script');
		signInJS.async = async;
		signInJS.src = src;
		signInJS.onload = onload;
		signInJS.text = inner_text_content; // LinkedIn
		document.head.appendChild(signInJS);
	}
}
