# 1.2.0
- New directive `GoogleSigninButtonDirective` (`<asl-google-signin-button></asl-google-signin-button>`)
- `GoogleLoginProvider` accepts a `GoogleInitOptions` object as 2nd argument, it has 2 optional properties: `oneTapEnabled` and `scopes`
- New `getAccessToken()` and `refreshAccessToken()` functions in `SocialAuthService` for google
- Update to support Angular 14
- Update various library internal dependencies for more recent versions

# 1.1.0
- Fix google authentication
- Bump dependency versions

# 1.0.2
- Minified build for Microsoft provider

# 1
- Angular 13 support

## 4.1.1
- Update to Angular 13
- Update several dependencies

## 4.1.0
- Update to new Google Identification libray

# 4.0.1
- Support for Angular 12

### 3.5.7
- Bug fix related to Facebook provider

### 3.5.6
- Bug fixes and additional features in Microsoft provider

### 3.5.5
- Bug fixes

### 3.5.4
- Support Angular 11

### 3.5.3
- Fix for #346

### 3.5.2
- Bug fixes

## 3.5.1
- Microsoft login provider
- Ability to refresh auth token with providers

## 3.4.1
- Fix for major issue #280

## 3.3.1
- VK login provider
- Optional `onError` callback added in `SocialAuthServiceConfig`

### 3.2.2
- Bug fixes

### 3.2.1
- LocalStorage based token persistence for Amazon provider
- Bug fixes related to offline access in Google provider

## 3.2.0
- Support for Angular 10
- Fix issue with route guards (thanks to @mokipedia)

## 3.1.0
- Added `initState` observable in `SocialAuthService`. The observable will complete once all the providers are ready.

# 3.0.0
- Refactor and rename the social auth service.
- Refactor the way one provides the config object.
- Removed the `LoginOptions` interface. A simple `Object` can be passed as options.
- Add Amazon login provider.
- Add option to disable auto-login with providers.
- Angular 9 support (with `--prod` flag)

## 2.2.1
- Angular 8 support
