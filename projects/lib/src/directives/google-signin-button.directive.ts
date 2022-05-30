import { Directive, ElementRef, Inject, OnDestroy} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GoogleLoginProvider } from '../providers/google-login-provider';
import { SocialAuthServiceConfig } from '../socialauth.service';

@Directive({
  selector: '[aslGoogleSigninButton]',
})
export class GoogleSigninButtonDirective implements OnDestroy {
  private readonly _destroy = new Subject<void>();

  constructor(
    @Inject('SocialAuthServiceConfig') config: SocialAuthServiceConfig | Promise<SocialAuthServiceConfig>,
    private readonly _el: ElementRef,
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
    const providerProvider = config.providers.find(({ id }) => id === GoogleLoginProvider.PROVIDER_ID);
    if (!providerProvider) {
      throw new Error('GoogleLoginProvider should be provided to use this component');
    }

    const googleProvider = providerProvider.provider as GoogleLoginProvider;
    googleProvider.initialized$.pipe(takeUntil(this._destroy)).subscribe(() => {
      google.accounts.id.renderButton(this._el.nativeElement, {
        type: 'icon',
        size: 'medium',
      });
    })
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
