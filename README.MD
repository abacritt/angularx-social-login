# Angular Social Login

> Use [Discussions](https://github.com/abacritt/angularx-social-login/discussions) for questions.

Social login and authentication module for Angular 16. Supports authentication with **Google**, **Facebook**, **Amazon**, **Microsoft**, and **VK** out of the box. Can be extended to other
providers also.

Check out the [demo](https://abacritt.github.io/angularx-social-login/).

### Compatibility Matrix

| Library Version                       | Angular Version |
|---------------------------------------|-----------------|
| @abacritt/angularx-social-login:2.1.X | 16, 17          |
| @abacritt/angularx-social-login:2.0.X | 15, 16          |
| @abacritt/angularx-social-login:1     | 13, 14, 15      |
| angularx-social-login:4               | 12, 13          |
| angularx-social-login:3               | 9, 10, 11       |
| angularx-social-login:2               | 5, 6, 7, 8      |

## Getting started

### Install via npm

```sh
npm i @abacritt/angularx-social-login
```

### Import the module

In your `AppModule`, import the `SocialLoginModule`

```javascript
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider
} from '@abacritt/angularx-social-login';

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
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [...]
})
export class AppModule { }
```

### Sign in and out users

```javascript

import { SocialAuthService } from "@abacritt/angularx-social-login";
import { FacebookLoginProvider } from "@abacritt/angularx-social-login";

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent {

  constructor(private authService: SocialAuthService) { }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
  }

}
```

### Sign in with google

`GoogleLoginProvider` has no `signIn()` method as other providers, the login flow is triggered by a button that the **gis client** is generating.
Calling `SocialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)` will have no effect.

Instead make sure you [subscribed to the authentication state](#subscribe-to-the-authentication-state) and add the following `GoogleSigninButtonDirective` (exported from the `GoogleSigninButtonModule`) to your component template to wrap the 'Sign In With Google' button:

ALSO

Check out the [Google button generator](https://developers.google.com/identity/gsi/web/tools/configurator).
[Link to Button attributes](https://developers.google.com/identity/gsi/web/reference/html-reference#element_with_class_g_id_signin)


```html
<asl-google-signin-button type='icon' size='medium'></asl-google-signin-button>
```
Options:
|  Name          | Type      | Value                                                     | Default       |
|----------------|-----------|-----------------------------------------------------------|---------------|
| type           | string    | 'icon' or 'standard'                                      | 'icon'        |
| size           | string    |  'small', 'medium' or 'large'                             | 'medium'      |
| shape          | string    |  'square','circle','pill' or 'rectangular'                | 'rectangular' |
| text           | string    |  'signin_with','signup_with'or 'continue_with'            | 'signin_with' |
| width          | string    |  '200 - 400 '                                             |               |
| theme          | string    |  'outline','filled_blue' or 'filled_black'                | 'outline'     |
| logo_alignment | string    |  'left' or 'center'                                       | 'left'        |





This will only work if the `GoogleLoginProvider` is registered in [SocialAuthServiceConfig](#import-the-module).

### Refresh google Auth Token

Once a user is logged in manual refresh token method can be triggered

```javascript

import { SocialAuthService } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  constructor(private authService: SocialAuthService) { }

  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

}
```

### Request google Access Token

Once a user is logged in an access token can be requested for the scopes we specified in `GoogleInitOptions.scopes`, you can then reuse this access token to make calls to google apis

```typescript

import { HttpClient } from '@angular/common/http';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  private accessToken = '';

  constructor(private authService: SocialAuthService, private httpClient: HttpClient) { }

  getAccessToken(): void {
    this.authService.getAccessToken(GoogleLoginProvider.PROVIDER_ID).then(accessToken => this.accessToken = accessToken);
  }

  getGoogleCalendarData(): void {
    if (!this.accessToken) return;

    this.httpClient
      .get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .subscribe((events) => {
        alert('Look at your console');
        console.log('events', events);
      });
  }
}
```

### Refresh google Access Token

Once a user is logged in and an access token was obtained, the access token can be refreshed (revoked)

```typescript

import { SocialAuthService } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  constructor(private authService: SocialAuthService) { }

  refreshToken(): void {
    this.authService.refreshAccessToken(GoogleLoginProvider.PROVIDER_ID);
  }

}
```

### Subscribe to the authentication state

You are notified when user logs in or logs out. You receive a `SocialUser` object when the user logs in and a `null` when the user logs out. `SocialUser` object contains basic user information such as name, email, photo URL, etc. along with the `auth_token`. You can communicate the `auth_token` to your server to authenticate the user in server and make API calls from server.

```javascript
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { SocialUser } from "@abacritt/angularx-social-login";

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
<img src="{{ user.photoUrl }}" referrerpolicy="no-referrer">
<div>
  <h4>{{ user.name }}</h4>
  <p>{{ user.email }}</p>
</div>
```

## Custom Provider

We can use a custom provider, implementing our own logic and needs like the following example:

```typescript
@Injectable({ providedIn: 'root' })
export class MyCustomLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID = 'CUSTOM' as const;

  constructor(/* infinite list of dependencies*/) {}
}
```
```typescript
@NgModule({
  declarations: [AppComponent, NavbarComponent, DemoComponent],
  imports: [BrowserModule, FormsModule, SocialLoginModule],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: true,
        providers: [
          {
            id: MyCustomLoginProvider.PROVIDER_ID,
            provider: MyCustomLoginProvider,
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
```

## Specifying custom scopes, fields etc. on initialization

```javascript
const fbLoginOptions = {
  scope: 'pages_messaging,pages_messaging_subscriptions,email,pages_show_list,manage_pages',
  return_scopes: true,
  enable_profile_selector: true
}; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11

const googleLoginOptions: GoogleInitOptions = {
  oneTapEnabled: false, // default is true
  scopes: 'https://www.googleapis.com/auth/calendar.readonly'
}; // https://developers.google.com/identity/oauth2/web/guides/use-token-model#initialize_a_token_client

const vkLoginOptions = {
  fields: 'photo_max,contacts', // Profile fields to return, see: https://vk.com/dev/objects/user
  version: '5.124', // https://vk.com/dev/versions
}; // https://vk.com/dev/users.get

let config = [
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
];
```

## Specifying custom scopes, fields etc. on login

```javascript
const fbLoginOptions = {
  scope: 'pages_messaging,pages_messaging_subscriptions,email,pages_show_list,manage_pages'
}; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11

this.authService.signIn(FacebookLoginProvider.PROVIDER_ID, fbLoginOptions);
```

## Providers

|Provider|Documentation|
|-|-|
|MicrosoftLoginProvider|[Link](microsoft-provider.md)|

## Running the demo app

```sh
ng build lib
ng serve
```
