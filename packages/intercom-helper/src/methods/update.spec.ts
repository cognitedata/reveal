import update from './update';

interface CustomGlobal extends NodeJS.Global {
  window: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Intercom: any;
  };
}

declare let global: CustomGlobal;

describe('Update Method', () => {
  beforeEach(() => {
    global.window = {
      Intercom: jest.fn(),
    };
  });

  it('Matching object', () => {
    const object = {
      name: 'name',
      email: 'email',
      hide_default_launcher: true,
      horizontal_padding: 15,
    };
    update(object);
    expect(global.window.Intercom).toHaveBeenCalledWith('update', {
      name: 'name',
      email: 'email',
      hide_default_launcher: true,
      horizontal_padding: 15,
    });
  });

  it('Empty object', () => {
    const object = {};
    update(object);
    expect(global.window.Intercom).not.toHaveBeenCalled();
  });

  it('Object with blacklisted key', () => {
    const object = {
      name: 'name2',
      email: 'email',
      hide_default_launcher: true,
      horizontal_padding: 0,
      user_id: 'my ID',
    };
    update(object);
    expect(global.window.Intercom).toHaveBeenCalledWith('update', {
      name: 'name2',
      email: 'email',
      hide_default_launcher: true,
      horizontal_padding: 0,
    });
  });

  afterEach(() => {
    delete global.window.Intercom;
  });
});
