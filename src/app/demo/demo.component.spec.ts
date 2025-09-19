import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DemoComponent } from './demo.component';
import { SocialAuthService } from 'angularx-social-login';
import { Observable } from 'rxjs';

describe('DemoComponent (Jest)', () => {
  let component: DemoComponent;
  let fixture: ComponentFixture<DemoComponent>;
  let socialAuthServiceMock: jest.Mocked<SocialAuthService>;

  beforeEach(async () => {
    // Create mock with jest.fn()
    socialAuthServiceMock = {
      authState: new Observable(),
      initState: jest.fn(),
      refreshAuthToken: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn()
    } as unknown as jest.Mocked<SocialAuthService>;

    await TestBed.configureTestingModule({
      imports: [DemoComponent],
      providers: [{ provide: SocialAuthService, useValue: socialAuthServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(DemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
