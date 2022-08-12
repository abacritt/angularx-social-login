import {Directive, ElementRef, Input} from '@angular/core';
import { take } from 'rxjs';
import { SocialAuthService } from '../socialauth.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'asl-google-signin-button',
})
export class GoogleSigninButtonDirective {
  @Input()
  type : 'icon' | 'standard' = 'icon';

  @Input()
  size: 'small' | 'medium' | 'large' = 'medium';
  
  @Input()
  text: 'signin_with' | 'signup_with' = 'signin_with';

  @Input()
  shape: 
  'square' | 'circle' | 'pill' | 'rectangular' = 'rectangular'

  
  @Input()
  width:any;


  constructor(
    el: ElementRef,
    socialAuthService: SocialAuthService
  ) {

    
    socialAuthService.initState.pipe(take(1)).subscribe(() => {

      if(this.width > 400 || this.width < 40)
      { 
        Promise.reject(
          'Please note .. max-width 400 , min-width 40 ' +
            '(https://developers.google.com/identity/gsi/web/tools/configurator)'
        );
      }

      else{
      google.accounts.id.renderButton(el.nativeElement, {
        type: this.type,
        size: this.size,
        text: this.text,
        width: this.width,
        shape: this.shape,
      });
    }
    })
  }
}
