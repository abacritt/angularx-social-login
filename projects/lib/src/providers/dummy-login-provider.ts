import {BaseLoginProvider} from '../entities/base-login-provider';
import {SocialUser} from '../entities/social-user';


// Simulates login / logout without actually requiring an Internet connection.
//
// Useful for certain development situations.
//
// For example, if you want to simulate the greatest football referee England has ever produced:
//
//  const dummyUser: SocialUser = {
//     id: '0123456789',
//     name: 'Howard Webb',
//     email: 'howard@webb.com',
//     firstName: 'Howard',
//     lastName: 'Webb',
//     authToken: 'dummyAuthToken',
//     photoUrl: 'https://en.wikipedia.org/wiki/Howard_Webb#/media/File:Howard_Webb_march11.jpg',
//     provider: 'DUMMY',
//     idToken: 'dummyIdToken',
//     authorizationCode: 'dummyAuthCode'
// };
//
//  let config = new AuthServiceConfig([
//  { ... },
//  {
//       id: DummyLoginProvider.PROVIDER_ID,
//       provider: new DummyLoginProvider(dummyUser)  // Pass your user into the constructor
//   },
//  { ... }
//  ]);


export class DummyLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID: string = 'DUMMY';

  static readonly DEFAULT_USER = {
    id: '1234567890',
    name: 'Mickey Mouse',
    email: 'mickey@mouse.com',
    firstName: 'Mickey',
    lastName: 'Mouse',
    authToken: 'dummyAuthToken',
    photoUrl: 'https://en.wikipedia.org/wiki/File:Mickey_Mouse.png',
    provider: 'DUMMY',
    idToken: 'dummyIdToken',
    authorizationCode: 'dummyAuthCode',
    response: {}
  };

  private dummy: SocialUser;

  private loggedIn: boolean;

  constructor(dummy?: SocialUser) {
    super();
    if (dummy) {
      this.dummy = dummy;
    } else {
      this.dummy = DummyLoginProvider.DEFAULT_USER;
    }

    // Start not logged in
    this.loggedIn = false;
  }

  getLoginStatus(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (this.loggedIn) {
        resolve(this.dummy);
      } else {
        reject('No user is currently logged in.');
      }
    });
  }

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  signIn(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      this.loggedIn = true;
      resolve(this.dummy);
    });
  }

  signOut(revoke?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loggedIn = false;
      resolve();
    });
  }
}
