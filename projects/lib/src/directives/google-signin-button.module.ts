import { NgModule } from '@angular/core';
import { GoogleSigninButtonDirective } from './google-signin-button.directive';

@NgModule({
  declarations: [GoogleSigninButtonDirective],
  exports: [GoogleSigninButtonDirective],
})
export class GoogleSigninButtonModule {}
