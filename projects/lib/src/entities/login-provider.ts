import { SocialUser } from './social-user';

export interface LoginProvider {
  initialize(): Promise<void>;
	getLoginStatus(loginStatusOptions?: any): Promise<SocialUser>;
	signIn(signInOptions?: any): Promise<SocialUser>;
	signOut(revoke?: boolean): Promise<void>;
}

