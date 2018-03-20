import { SocialUser } from './user';
import { LoginOpt } from '../auth.service';

export interface LoginProvider {
  initialize(): Promise<SocialUser>;
  signIn(opt?: LoginOpt): Promise<SocialUser>;
  signOut(): Promise<any>;
}

