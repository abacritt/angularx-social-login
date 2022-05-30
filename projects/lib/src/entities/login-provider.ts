import { Observable } from 'rxjs';
import { SocialUser } from './social-user';

export interface LoginProvider {
	readonly observe?: true;
  initialize(): Promise<void>;
	getLoginStatus(loginStatusOptions?: { refreshToken: true }): Promise<SocialUser> | Observable<SocialUser>;
	signIn?(signInOptions?: any): Promise<SocialUser>;
	signOut(revoke?: boolean): Promise<void>;
}

