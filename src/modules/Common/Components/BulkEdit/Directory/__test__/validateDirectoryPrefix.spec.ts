import { validateDirectoryPrefix } from 'src/modules/Common/Components/BulkEdit/Directory/validateDirectoryPrefix';

const STRING_WITH_512_CHARACTERS =
  '/Z8Ms3KsJLB4Ao6KPBzuAhq1PwLZ8EeGudEAh7NahMoqsZ4XnvMmksTTORt9mQJKcvlI8HlC8uwBcLgYAg3W9NwbOqXq96MiWYtHdtkGkAHf2S9aeXrdxJvc45iriSEHcbb5QSbaK23P2A5jC475gwYLKQNccH2FjblEUTVM6H8hedAb45B7GGEW4xBlecVa1DaA26zaaNEi3IuTiN97AZajk7KSPmyhWCjPwk61iCeUuyzrKcwdoycZemHWqX5z8ovqiLTA2LV2CLiF7eTHB5n8nXOkyYHTRfj97ZN46RbQCCXMN635DgnLYbfYHUMGVipWmJTV7MbEjBph4wYUDMGD9Kp7pngAkb8cQZdaZjXOlatAD8qEK6nuozYILrHgrU21061W8W4KMwPgdOydH38tYNZrB1FNRf4CHC6DllpHWog77qPGKOoUZsybhpN2uYtiyRQQ9oGAVMUkkXtB721FROEkwj00nnGxH8VoO6nqbB9YjIj9uPwamBIs6nuE';

describe('test validateDirectoryPrefix fn', () => {
  test('if directory is undefined', () => {
    expect(validateDirectoryPrefix({ directory: undefined })).toBe(false);
  });

  describe('if directory is defined', () => {
    test('if directory is blank', () => {
      expect(validateDirectoryPrefix({ directory: '' })).toBe(false);
    });

    test('should start with a /', () => {
      expect(validateDirectoryPrefix({ directory: 'directoryName' })).not.toBe(
        false
      );
      expect(validateDirectoryPrefix({ directory: '/directoryName' })).toBe(
        false
      );
    });

    test('directory length must be up to 512 characters', () => {
      expect(
        validateDirectoryPrefix({ directory: `${STRING_WITH_512_CHARACTERS}A` })
      ).not.toBe(false);
      expect(
        validateDirectoryPrefix({ directory: STRING_WITH_512_CHARACTERS })
      ).toBe(false);
    });
  });
});
