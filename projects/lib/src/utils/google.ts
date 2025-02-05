
export const isGoogleAccountDefined = (): boolean => {
  return typeof window.google?.accounts !== 'undefined';
}

export const assertGoogleAccountDefined = (): void => {
  if (!isGoogleAccountDefined()) {
    throw new Error('Google Accounts API is undefined');
  } 
}

export const getGoogleAccountOrThrow = (): typeof google.accounts=> {
  assertGoogleAccountDefined();

  return window.google.accounts;
}