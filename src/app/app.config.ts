import {ApplicationConfig, provideZoneChangeDetection} from "@angular/core";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {
    GoogleLoginProvider,
    FacebookLoginProvider,
    AmazonLoginProvider,
    VKLoginProvider,
    MicrosoftLoginProvider,
    SocialAuthServiceConfig,
} from 'lib';

export const appConfig: ApplicationConfig = {
    providers: [provideZoneChangeDetection({eventCoalescing: true}),
        provideAnimationsAsync(),
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: true,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(
                            '624796833023-clhjgupm0pu6vgga7k5i5bsfp6qp6egh.apps.googleusercontent.com'
                        ),
                    },
                    {
                        id: FacebookLoginProvider.PROVIDER_ID,
                        provider: new FacebookLoginProvider('561602290896109'),
                    },
                    {
                        id: AmazonLoginProvider.PROVIDER_ID,
                        provider: new AmazonLoginProvider(
                            'amzn1.application-oa2-client.f074ae67c0a146b6902cc0c4a3297935'
                        ),
                    },
                    {
                        id: VKLoginProvider.PROVIDER_ID,
                        provider: new VKLoginProvider('7624815'),
                    },
                    {
                        id: MicrosoftLoginProvider.PROVIDER_ID,
                        provider: new MicrosoftLoginProvider(
                            '0611ccc3-9521-45b6-b432-039852002705'
                        ),
                    },
                ],
            } as SocialAuthServiceConfig,
        }]
};
