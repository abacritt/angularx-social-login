
export class SocialUser {

  constructor( ){
  }

  provider: string | undefined;
  id: string | undefined;
  email: string | undefined;
  name: string | undefined;
  photoUrl: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  authToken: string | undefined;

  idToken: string | undefined; // Reference https://developers.google.com/identity/sign-in/web/backend-auth
  authorizationCode: string | undefined; // Reference https://developers.google.com/identity/sign-in/web/reference#googleauthgrantofflineaccessoptions

  response: any;
}
