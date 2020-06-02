import { SocialUser } from './social-user';
import { LoginOptions } from './login-option';

export interface LoginProvider {
  initialize(): Promise<void>;
	getLoginStatus(): Promise<SocialUser>;
	signIn(opt?: LoginOptions): Promise<SocialUser>;
	signOut(revoke?: boolean): Promise<any>;
}

