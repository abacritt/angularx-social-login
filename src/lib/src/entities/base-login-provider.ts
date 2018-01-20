import { LoginProvider } from "./login-provider";
import { SocialUser } from './user';

export abstract class BaseLoginProvider implements LoginProvider {

  constructor() {}

  abstract initialize(): Promise<SocialUser>;
  abstract signIn(): Promise<SocialUser>;
  abstract signOut(): Promise<any>;

  loadScript(id: string, src: string, onload: any): void {
      if (document.getElementById(id)) { return; }

      let signInJS = document.createElement("script");
      signInJS.async = true;
      signInJS.src = src;
      signInJS.onload = onload;
      document.head.appendChild(signInJS);
  }
}
