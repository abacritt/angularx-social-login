import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { DemoComponent } from './demo/demo.component';

@Component({
  selector: 'lib-app-root',
  imports: [NavbarComponent, DemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class AppComponent {
  title = 'app works!';
}
