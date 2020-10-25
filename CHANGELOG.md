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
