export interface LoginOptions {
  /**
   * Facebook FB.login options: https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11.
   */
  auth_type?: string; // Optional key, only supports one value: rerequest. Use this when re-requesting a declined permission.
  scope?: string; // Comma separated list of extended permissions
  return_scopes?: boolean; // When true, the granted scopes will be returned in a comma-separated list.
  enable_profile_selector?: boolean; // When true, prompt the user to grant permission for one or more Pages.
  profile_selector_ids?: string; // Comma separated list of IDs to display in the profile selector
  /**
   * Google gapi.auth2.ClientConfig: \
   * https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig.
   */
  /* Required. The app's client ID, found and created in the Google Developers Console.*/
  client_id?: string;
  /* The domains for which to create sign-in cookies. Either a URI,
  single_host_origin, or none. Defaults to single_host_origin if unspecified. */
  cookie_policy?: string;
  /* Fetch users' basic profile information when they sign in. Adds 'profile',
  'email' and 'openid' to the requested scopes. True if unspecified. */
  fetch_basic_profile?: boolean;
  /* The G Suite domain to which users must belong to sign in.
  This is susceptible to modification by clients, so be sure to verify
  the hosted domain property of the returned user.
  Use GoogleUser.getHostedDomain() on the client, and the hd claim in
  the ID Token on the server to verify the domain is what you expected. */
  hosted_domain?: string;
  /* Used only for OpenID 2.0 client migration. Set to the value
  of the realm that you are currently using for OpenID 2.0,
  as described in OpenID 2.0 (Migration). */
  openid_realm?: string;
  /* The UX mode to use for the sign-in flow. By default, it will open the consent flow in a popup. Valid values are popup and redirect. */
  ux_mode?: string;
  /* If using ux_mode='redirect', this parameter allows you to override
  the default redirect_uri that will be used at the end of the consent flow.
  The default redirect_uri is the current URL stripped of query parameters
  and hash fragment. */
  redirect_uri?: string;
  /* Get permission from the user to access the specified scopes offline,
   * If using offline_access=true, GoogleAuth.grantOfflineAccess() will be use instead of GoogleAuth.signIn()
   */
  offline_access?: boolean;
  /*
   A space-delimited list of string values that specifies whether the authorization server prompts the user for reauthentication
   and consent. The possible values are:
    none
      The authorization server does not display any authentication or user consent screens; it will return an error if the user is not
      already authenticated and has not pre-configured consent for the requested scopes. You can use none to check for existing
      authentication and/or consent.
    consent
      The authorization server prompts the user for consent before returning information to the client.
    select_account
      The authorization server prompts the user to select a user account. This allows a user who has multiple accounts at the authorization
      server to select amongst the multiple accounts that they may have current sessions for.

   If no value is specified and the user has not previously authorized access, then the user is shown a consent screen.
  */
  prompt?: string;
  /*
    The email, or User ID, of a user to pre-select in the sign-in flow.
    This is susceptible to modification by the user, unless prompt: "none" is used.
  */
  login_hint?: string;
  scope_data?: any;
}
