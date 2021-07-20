# Microsoft Provider
The Microsoft Provider uses the [MSAL.js 2.0](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser) library provided by Microsoft for authenticating against [Azure Active Directory or Microsoft Personal Accounts](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app), or an on-premise [Active Directory with Federation Services](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-net-adfs-support).

## Configuration
The configuration options for angularx-social-login are a subset of the MSAL configuration options documented [here](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md).  The clientId for the registered application is the first argument provided when initializing the MicrosoftLoginProvider:

```typescript
{
  id: MicrosoftLoginProvider.PROVIDER_ID,
  provider: new MicrosoftLoginProvider('__CLIENT_ID__', {
    redirect_uri: 'https://localhost:4200',
    logout_redirect_uri: 'https://localhost:4200/logout'
  }),
}
```

The second argument can have the following fields (all fields are optional):

|Field|Type|Description|Default Value|
|-|-|-|-|
|authority|string|The authority URL like `https://{uri}/{tenantid}`|`'https://login.microsoftonline.com/common/'`|
|scopes|string[]|[Scopes](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes) requested during login|`['openid', 'email', 'profile', 'User.Read']`|
|redirect_uri|string|The configured redirect URL for the registered application|`location.origin`|
|logout_redirect_uri|string|The logout URL that the user is returned to after logging out|`location.href`|
|knownAuthorities|string[]|An array of valid authority URL|`null` (all authorities are valid)|
|protocolMode|ProtocolMode|The protocol to use, AAD or OIDC|`ProtocolMode.AAD`|
|clientCapabilities|string[]|Array of capabilities to be added to all network requests as part of the xms_cc claims request|null|
|cacheLocation|string|Location of token cache in browser|`'sessionStorage'`|
|prompt|string|Indicates the type of user interaction that is required. The only valid values at this time are `login`, `none`, `select_account`, and `consent`|`none`
