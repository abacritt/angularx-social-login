# Angular Social Login

[![Gitter](https://badges.gitter.im/angularx-social-login/community.svg)](https://gitter.im/angularx-social-login/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Social login and authentication module for Angular 9+. Supports authentication with **Google**, **Facebook**, **Amazon**, and **VK** out of the box. Can be extended to other providers also.

Check out the [demo](https://abacritt.github.io/angularx-social-login/).

> Note: For compatibility with older versions Angular (e.g. Angular 8 and older), please use an older version of the library. Check [this comment on the compatibility with Angular versions](https://github.com/abacritt/angularx-social-login/pull/286#discussion_r449864732) and [this comment on how to use the older version of the library](https://github.com/abacritt/angularx-social-login/issues/283#issuecomment-652930750).

## Getting started

### Install via npm

```sh
npm i angularx-social-login
```

### Import the module

In your `AppModule`, import the `SocialLoginModule`

```javascript
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider
} from 'angularx-social-login';

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
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              'clientId'
            )
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('clientId')
          }
        ]
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [...]
})
export class AppModule { }
```

### Sign in and out users

```javascript

import { SocialAuthService } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  constructor(private authService: SocialAuthService) { }

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

You are notified when user logs in or logs out. You receive a `SocialUser` object when the user logs in and a `null` when the user logs out. `SocialUser` object contains basic user information such as name, email, photo URL, etc. along with the `auth_token`. You can communicate the `auth_token` to your server to authenticate the user in server and make API calls from server.

```javascript
import { SocialAuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  user: SocialUser;
  loggedIn: boolean;

  constructor(private authService: SocialAuthService) { }

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

## Specifying custom scopes, fields etc. on initialization

```javascript
const fbLoginOptions = {
  scope: 'pages_messaging,pages_messaging_subscriptions,email,pages_show_list,manage_pages',
  return_scopes: true,
  enable_profile_selector: true
}; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11

const googleLoginOptions = {
  scope: 'profile email'
}; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig

const vkLoginOptions = {
  fields: 'photo_max,contacts', // Profile fields to return, see: https://vk.com/dev/objects/user
  version: '5.124', // https://vk.com/dev/versions
}; // https://vk.com/dev/users.get

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("Google-OAuth-Client-Id", googleLoginOptions)
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider("Facebook-App-Id", fbLoginOptions)
  },
  {
    id: VKLoginProvider.PROVIDER_ID,
    provider: new VKLoginProvider("VK-App-Id", vkLoginOptions)
  },
]);
```

## Specifying custom scopes, fields etc. on login

```javascript
const fbLoginOptions = {
  scope: 'pages_messaging,pages_messaging_subscriptions,email,pages_show_list,manage_pages'
}; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11

this.authService.signIn(FacebookLoginProvider.PROVIDER_ID, fbLoginOptions);
```

## Running the demo app

```sh
ng serve
```
