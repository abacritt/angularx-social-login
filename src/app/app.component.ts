import {Component} from '@angular/core';
import {SocialLoginModule} from "lib";
import {FormsModule} from "@angular/forms";
import {DemoComponent} from "./demo/demo.component";
import {NavbarComponent} from "./navbar/navbar.component";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'lib-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, FormsModule, SocialLoginModule, DemoComponent, NavbarComponent],
  standalone: true
})
export class AppComponent {
  title = 'app works!';
}
