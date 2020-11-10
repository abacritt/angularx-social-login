import { SocialUser } from './social-user';

export interface LoginProvider {
  initialize(): Promise<void>;
	getLoginStatus(refreshAuthToken?: boolean): Promise<SocialUser>;
	signIn(signInOptions?: any): Promise<SocialUser>;
	signOut(revoke?: boolean): Promise<any>;
}

