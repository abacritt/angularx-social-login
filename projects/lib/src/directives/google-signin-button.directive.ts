import { Directive, ElementRef, Inject} from '@angular/core';
import { take } from 'rxjs';
import { GoogleLoginProvider } from '../providers/google-login-provider';
import { SocialAuthService, SocialAuthServiceConfig } from '../socialauth.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'asl-google-signin-button',
})
export class GoogleSigninButtonDirective {
  constructor(
    @Inject('SocialAuthServiceConfig') config: SocialAuthServiceConfig | Promise<SocialAuthServiceConfig>,
    private readonly _el: ElementRef,
    private readonly _socialAuthService: SocialAuthService
  ) {
    if (config instanceof Promise) {
      config.then((config: SocialAuthServiceConfig) => {
        this.initialize(config);
      });
    } else {
      this.initialize(config);
    }
  }

  initialize(config: SocialAuthServiceConfig) {
    if (!config.providers.some(({ id }) => id === GoogleLoginProvider.PROVIDER_ID)) {
      throw new Error('GoogleLoginProvider should be provided to use this directive');
    }

    this._socialAuthService.initState.pipe(take(1)).subscribe(() => {
      google.accounts.id.renderButton(this._el.nativeElement, {
        type: 'icon',
        size: 'medium',
      });
    })
  }
}
