import { SocialUser } from './user';

export interface LoginProvider {
  initialize(): Promise<SocialUser>;
  signIn(): Promise<SocialUser>;
  signOut(): Promise<any>;
}

