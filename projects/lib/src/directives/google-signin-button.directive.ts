import { Directive, ElementRef, Input, inject } from '@angular/core';
import { take } from 'rxjs/operators';
import { SocialAuthService } from '../socialauth.service';
import { isGoogleAccountsDefined } from '../utils/google';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'asl-google-signin-button',
    standalone: true
})
export class GoogleSigninButtonDirective {
  @Input()
  type: 'icon' | 'standard' = 'icon';

  @Input()
  size: 'small' | 'medium' | 'large' = 'medium';

  @Input()
  text: 'signin_with' | 'signup_with' | 'continue_with' = 'signin_with';

  @Input()
  shape: 'square' | 'circle' | 'pill' | 'rectangular' = 'rectangular';

  @Input()
  theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline';

  @Input()
  logo_alignment: 'left' | 'center' = 'left';

  @Input()
  width: number = 0;

  @Input()
  locale: string = '';

  constructor() {
    const el = inject(ElementRef);
    const socialAuthService = inject(SocialAuthService);

    socialAuthService.initState.pipe(take(1)).subscribe(() => {
      Promise.resolve(this.width).then((value) => {
        if (value > 400 || (value < 200 && value != 0)) {
          Promise.reject(
            'Please note .. max-width 400 , min-width 200 ' +
              '(https://developers.google.com/identity/gsi/web/tools/configurator)'
          );
        } else if (isGoogleAccountsDefined()) {
          google.accounts.id.renderButton(el.nativeElement, {
            type: this.type,
            size: this.size,
            text: this.text,
            width: this.width,
            shape: this.shape,
            theme: this.theme,
            logo_alignment: this.logo_alignment,
            locale: this.locale,
          });
        }
      });
    });
  }
}
