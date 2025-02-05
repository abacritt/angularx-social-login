
export const isGoogleAccountsDefined = (): boolean => {
  return typeof window.google?.accounts !== 'undefined';
}

export const assertGoogleAccountsDefined = (): void => {
  if (!isGoogleAccountsDefined()) {
    throw new Error('Google Accounts API is undefined');
  } 
}

export const getGoogleAccountsOrThrow = (): typeof google.accounts=> {
  assertGoogleAccountsDefined();

  return window.google.accounts;
}
