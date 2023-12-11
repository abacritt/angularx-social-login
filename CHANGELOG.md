# 2.2.0
- Update to Angular 17
- Update several dependencies

# 2.1.0
- Update to Angular 16
- Update several dependencies

# 2.0.0
- BREAKING CHANGE: export `GoogleSigninButtonDirective` from its own module (`GoogleSigninButtonModule`)
- Export VK Login scopes
- Update dependencies

# 1.3.0
- Add Angular V15 support
- Change minimum supported version to Angular 15

# 1.2.6
- Update several dependencies
- Update Angular to the latest V14 support version

# 1.2.5
## What's Changed
* Auto stash before rebase of "feature/updateDependencies" by @Heatmanofurioso in https://github.com/abacritt/angularx-social-login/pull/594
* console.log in ButtonDirective deleted by @JoseSolorzanoC in https://github.com/abacritt/angularx-social-login/pull/608
* add: [Google]prompt property on initTokenClient by @kattoshi in https://github.com/abacritt/angularx-social-login/pull/588

# 1.2.4
- Update dependencies
- Update required dependencies versioning 

# 1.2.3
- Add new configurations to Google Button Directive
- Update json token parsing

# 1.2.2
- Add UI configurations to Google Directive Button "Type and size"
- Support `prompt_parent_id` in Google Directive
- Update dependencies

# 1.2.1
- Update Angular dependencies
- Add custom injectable provider support

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
