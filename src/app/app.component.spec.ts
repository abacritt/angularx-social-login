import { TestBed, waitForAsync } from '@angular/core/testing';

import { AppComponent } from './app.component';
import {NavbarComponent} from './navbar/navbar.component';
import {DemoComponent} from './demo/demo.component';
import {SocialAuthService} from 'lib';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {Observable} from 'rxjs';

describe('AppComponent', () => {
  let socialAuthServiceMock: SpyObj<SocialAuthService>;

  socialAuthServiceMock = createSpyObj('socialAuthService', ['authState', 'initState', 'refreshAuthToken', 'signIn', 'signOut']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NavbarComponent,
        DemoComponent
      ],
      providers: [{ provide: SocialAuthService, useValue: {...socialAuthServiceMock, authState: new Observable()} }]
    }).compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'app works!'`, waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app works!');
  }));

  it('should render title in a h1 tag', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('app works!');
  }));
});
