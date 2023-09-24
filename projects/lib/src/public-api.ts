export {
  SocialAuthService,
  SocialAuthServiceConfig,
} from './socialauth.service';
export { SocialLoginModule } from './sociallogin.module';
export { SocialUser } from './entities/social-user';
export { LoginProvider } from './entities/login-provider';
export { BaseLoginProvider } from './entities/base-login-provider';
export { DummyLoginProvider } from './providers/dummy-login-provider';
export {
  GoogleInitOptions,
  GoogleLoginProvider,
} from './providers/google-login-provider';

export { GoogleSigninButtonDirective } from './directives/google-signin-button.directive';
export { GoogleSigninButtonModule } from './directives/google-signin-button.module';
