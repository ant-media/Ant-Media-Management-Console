import { PdPPage } from './app.po';

describe('pd-p App', () => {
  let page: PdPPage;

  beforeEach(() => {
    page = new PdPPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
