export class SocialUser {
  provider: string;
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
  authToken: string;
  
  //This token will be used by google provider. 
  //Reference https://developers.google.com/identity/sign-in/web/backend-auth
  tokenId: string; 
}
