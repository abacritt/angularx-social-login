import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'lib-app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class NavbarComponent {
  constructor() {}
}
