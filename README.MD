# Angular 8 Social Login

Social login and authentication module for Angular 8 (supports Angular 4+). Supports authentication with **Google** and **Facebook**. 
Can be extended to other providers also.

Includes a **Dummy** login provider for development purposes.

Check out the [demo](https://abacritt.github.io/angularx-social-login/).

## Getting started

### Install via npm 

```sh
npm install --save angularx-social-login
```

### Import the module

In your `AppModule`, import the `SocialLoginModule`

```javascript
import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";


let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("Google-OAuth-Client-Id")
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider("Facebook-App-Id")
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    SocialLoginModule
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  bootstrap: [...]
})
export class AppModule { }
```

### Sign in and out users

```javascript

import { AuthService } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";


@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  constructor(private authService: AuthService) { }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  } 

  signOut(): void {
    this.authService.signOut();
  }

}
```

### Subscribe to the authentication state

You are notified when user logs in or logs out. You receive a `SocialUser` object when the user logs in and a `null` when the user logs out. `SocialUser` object contains basic user information such as name, email, photo URL, etc.

```javascript
import { AuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  private user: SocialUser;
  private loggedIn: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
  }

}
```

### Display the user information

```html
<img src="{{ user.photoUrl }}">
<div>
  <h4>{{ user.name }}</h4>
  <p>{{ user.email }}</p>
</div>
```

## Specifying custom scope

```javascript
const fbLoginOptions: LoginOpt = {
  scope: 'pages_messaging,pages_messaging_subscriptions,email,pages_show_list,manage_pages',
  return_scopes: true,
  enable_profile_selector: true
}; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11

const googleLoginOptions: LoginOpt = {
  scope: 'profile email'
}; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("Google-OAuth-Client-Id", googleLoginOptions)
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider("Facebook-App-Id", fbLoginOptions)
  }
]);
```

## Building with AoT

If you are facing issue in building your app with AoT, check [this document](https://github.com/abacritt/angularx-social-login/blob/master/README-AOT.md).

## Running the demo app

```sh
cd demo
npm install
ng serve
```

## Dummy provider

There is also a `DummyLoginProvider`, which simulates login / logout without actually 
requiring an Internet connection.  Useful for certain development situations.

### Usage

#### Simple use case

Just add the `DummyLoginProvider` to your `AuthServiceConfig()` as described above
and then follow the same model as the other providers.

```
let config = new AuthServiceConfig([
  { ... },
  {
      id: DummyLoginProvider.PROVIDER_ID,
      provider: new DummyLoginProvider()
  },
  { ... }
]);
```

#### Bring your own user

The simple model hard-wires a certain caertoon rodent as the authenticated user. 

If you would like to control the authenticated user identity, you can pass an
optional `SocialUser` object into the constructor.

For example, if you want to simulate the greatest football referee England has ever produced:

```
const dummyUser: SocialUser = {
    id: '0123456789',
    name: 'Howard Webb',
    email: 'howard@webb.com',
    firstName: 'Howard',
    lastName: 'Webb',
    authToken: 'dummyAuthToken',
    photoUrl: 'https://en.wikipedia.org/wiki/Howard_Webb#/media/File:Howard_Webb_march11.jpg',
    provider: 'DUMMY',
    idToken: 'dummyIdToken',
    authorizationCode: 'dummyAuthCode'
};

let config = new AuthServiceConfig([
  { ... },
  {
      id: DummyLoginProvider.PROVIDER_ID,
      provider: new DummyLoginProvider(dummyUser)  // Pass your user into the constructor
  },
  { ... }
]);
```
