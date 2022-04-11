import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DemoComponent } from './demo.component';
import {SocialAuthService} from 'lib';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {Observable} from 'rxjs';

describe('DemoComponent', () => {
  let component: DemoComponent;
  let fixture: ComponentFixture<DemoComponent>;
  let socialAuthServiceMock: SpyObj<SocialAuthService>;

  socialAuthServiceMock = createSpyObj('socialAuthService', ['authState', 'initState', 'refreshAuthToken', 'signIn', 'signOut']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoComponent ],
      providers: [{ provide: SocialAuthService, useValue: {...socialAuthServiceMock, authState: new Observable()} }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
