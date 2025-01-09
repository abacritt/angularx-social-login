import {Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {SocialLoginModule} from "lib";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'lib-app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, FormsModule, SocialLoginModule],
  standalone: true
})
export class NavbarComponent {
  constructor() {
  }
}
