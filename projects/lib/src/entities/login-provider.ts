import { SocialUser } from './social-user';

export interface LoginProvider {
  getLoginStatus(): Promise<SocialUser>;
	signIn(signInOptions?: any): Promise<SocialUser>;
	signOut(revoke?: boolean): Promise<any>;
}

