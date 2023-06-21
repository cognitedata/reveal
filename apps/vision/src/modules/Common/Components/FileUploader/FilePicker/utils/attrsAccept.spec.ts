import { attrAccept as accept } from './attrAccept';

describe('accept', () => {
  it('should return true if called without acceptedFiles', () => {
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'some/type',
        },
        // @ts-expect-error
        undefined
      )
    ).toBe(true);
  });

  it('should not throw and return true if file is empty or null', () => {
    expect(() => {
      // @ts-expect-error
      accept({});

      // @ts-expect-error
      accept({}, 'text/html');

      // @ts-expect-error
      accept({}, '*.png');

      // @ts-expect-error
      accept({}, 'image/*');

      // @ts-expect-error
      accept(null);

      // @ts-expect-error
      accept(null, 'text/html');

      // @ts-expect-error
      accept(null, '*.png');

      // @ts-expect-error
      accept(null, 'image/*');
    }).not.toThrow();
  });

  it('should properly validate if called with concrete mime types', () => {
    const acceptedMimeTypes = 'text/html,image/jpeg,application/json';
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'text/html',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'image/jpeg',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'application/json',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'image/bmp',
        },
        acceptedMimeTypes
      )
    ).toBe(false);
    expect(
      accept(
        // @ts-expect-error
        { type: 'image/bmp' },
        acceptedMimeTypes
      )
    ).toBe(false);
  });

  it('should properly validate if called with base mime types', () => {
    const acceptedMimeTypes = 'text/*,image/*,application/*';
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'text/html',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'image/jpeg',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'application/json',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'image/bmp',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'some/type',
        },
        acceptedMimeTypes
      )
    ).toBe(false);
  });

  it('should properly validate if called with mixed mime types', () => {
    const acceptedMimeTypes = 'text/*,image/jpeg,application/*';
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'text/html',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'image/jpeg',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'image/bmp',
        },
        acceptedMimeTypes
      )
    ).toBe(false);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'application/json',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'some/type',
        },
        acceptedMimeTypes
      )
    ).toBe(false);
  });

  it('should properly validate even with spaces in between', () => {
    const acceptedMimeTypes = 'text/html ,   image/jpeg, application/json';
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'text/html',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.png',
          type: 'image/jpeg',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
  });

  it('should properly validate extensions', () => {
    const acceptedMimeTypes = 'text/html ,    image/jpeg, .pdf  ,.png';
    expect(
      accept(
        {
          name: 'somxsfsd',
          type: 'text/html',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'somesdfsdf',
          type: 'image/jpeg',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'somesdfadfadf',
          type: 'application/json',
        },
        acceptedMimeTypes
      )
    ).toBe(false);
    expect(
      accept(
        {
          name: 'some-file file.pdf',
          type: 'random/type',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'some-file.pdf file.gif',
          type: 'random/type',
        },
        acceptedMimeTypes
      )
    ).toBe(false);
    expect(
      accept(
        {
          name: 'some-FILEi File.PNG',
          type: 'random/type',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
  });

  it('should allow accepted files passed to be an array', () => {
    const acceptedMimeTypes = ['img/jpeg', '.pdf'];
    expect(
      accept(
        {
          name: 'testfile.pdf',
          type: 'random/type',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.jpg',
          type: 'img/jpeg',
        },
        acceptedMimeTypes
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile',
          type: 'application/json',
        },
        acceptedMimeTypes
      )
    ).toBe(false);
  });

  it('should check MIME types in a case insensitive way', () => {
    expect(
      accept(
        {
          name: 'testfile.xlsm',
          type: 'application/vnd.ms-excel.sheet.macroenabled.12',
        },
        ['application/vnd.ms-excel.sheet.macroEnabled.12']
      )
    ).toBe(true);
    expect(
      accept(
        {
          name: 'testfile.xlsm',
          type: 'application/vnd.ms-excel.sheet.macroEnabled.12',
        },
        ['application/vnd.ms-excel.sheet.macroenabled.12']
      )
    ).toBe(true);
  });
});
