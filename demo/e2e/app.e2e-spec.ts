import { Ng4socialTestPage } from './app.po';

describe('ng4social-test App', () => {
  let page: Ng4socialTestPage;

  beforeEach(() => {
    page = new Ng4socialTestPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
