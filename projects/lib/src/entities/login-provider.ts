import { Observable } from 'rxjs';
import { SocialUser } from './social-user';

export interface LoginProvider {
	readonly socialUser$?: Observable<SocialUser>;
	readonly initialized$?: Observable<true>;
  initialize(): Promise<void>;
	getLoginStatus(loginStatusOptions?: any): Promise<SocialUser>;
	signIn(signInOptions?: any): Promise<SocialUser>;
	signOut(revoke?: boolean): Promise<void>;
}

