import show from './show';

describe('Set visibility', () => {
  beforeEach(() => {
    window.Intercom = jest.fn();
  });

  it('Should show', () => {
    show(true);
    expect(window.Intercom).toHaveBeenCalledWith('show');
  });

  it('Should hide', () => {
    show(false);
    expect(window.Intercom).toHaveBeenCalledWith('hide');
  });

  afterEach(() => {
    delete window.Intercom;
  });
});
