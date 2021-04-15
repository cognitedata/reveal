import show from './show';

interface CustomGlobal extends NodeJS.Global {
  window: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Intercom: any;
  };
}

declare let global: CustomGlobal;

describe('Set visibility', () => {
  beforeEach(() => {
    global.window = {
      Intercom: jest.fn(),
    };
  });

  it('Should show', () => {
    show(true);
    expect(global.window.Intercom).toHaveBeenCalledWith('show');
  });

  it('Should hide', () => {
    show(false);
    expect(global.window.Intercom).toHaveBeenCalledWith('hide');
  });

  afterEach(() => {
    delete global.window.Intercom;
  });
});
