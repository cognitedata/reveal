import { Label } from '@cognite/cogs.js';

import { EMPTY_FIELD_PLACEHOLDER } from '../../../constants/general';
import {
  EMPTY_COMMENT_PLACEHOLDER,
  EMPTY_PATH_PLACEHOLDER,
} from '../constants';
import { EmptyCell } from '../elements';
import { formatItem } from '../formatItem';
import { FilePath } from '../formats/FilePath';
import { Text } from '../formats/Text';

describe('meta data table', () => {
  it(`should return "${EMPTY_FIELD_PLACEHOLDER}" for null value without type`, async () => {
    const result = formatItem({ value: '' });
    expect(result).toMatchObject(
      <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
    );
  });

  it('should return value for non typed', async () => {
    const result = formatItem({ value: '123' });
    expect(result).toMatchObject(<>123</>);

    const emptyResult = formatItem({});
    expect(emptyResult).toMatchObject(
      <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
    );
  });

  it('should format file size', async () => {
    const byteResult = formatItem({ value: '123', type: 'filesize' });
    expect(byteResult).toMatchObject(<>123 Bytes</>);

    const kbResult = formatItem({ value: 1048575, type: 'filesize' });
    expect(kbResult).toMatchObject(<>1024.00 KB</>);

    const mbResult = formatItem({ value: 10485744, type: 'filesize' });
    expect(mbResult).toMatchObject(<>10.00 MB</>);

    const gbResult = formatItem({ value: 1073741825, type: 'filesize' });
    expect(gbResult).toMatchObject(<>1.00 GB</>);

    const emptyResult = formatItem({ type: 'filesize' });
    expect(emptyResult).toMatchObject(
      <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
    );
  });

  it('should format date', async () => {
    const date = new Date(2000, 1, 1).getTime();
    const result = formatItem({ value: date, type: 'date' });
    expect(result).toMatchObject(<>01-Feb-2000</>);

    const emptyResult = formatItem({ type: 'date' });
    expect(emptyResult).toMatchObject(
      <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
    );
  });

  it('should format label', async () => {
    const result = formatItem({ type: 'label', value: '123' });
    expect(result).toMatchObject(<Label>123</Label>);

    const emptyResult = formatItem({ type: 'label' });
    expect(emptyResult).toMatchObject(
      <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
    );
  });

  it('should format path', async () => {
    const result = formatItem({ type: 'path', value: 'path' });
    expect(result).toMatchObject(<FilePath>path</FilePath>);

    const emptyResult = formatItem({ type: 'path' });
    expect(emptyResult).toMatchObject(
      <FilePath>
        <EmptyCell>{EMPTY_PATH_PLACEHOLDER}</EmptyCell>
      </FilePath>
    );

    // need to look into this case:
    // expect(formatItem({ type: 'path', value: ['path', 'path2'] })).toMatchObject(
    //   <>
    //     <Label>path</Label>
    //     <Label>path2</Label>
    //   </>
    // );
  });

  it('should format text', async () => {
    const result = formatItem({ type: 'text', value: 'comment' });
    expect(result).toMatchObject(<Text>comment</Text>);

    const emptyResult = formatItem({ type: 'text' });
    expect(emptyResult).toMatchObject(
      <Text>
        <EmptyCell>{EMPTY_COMMENT_PLACEHOLDER}</EmptyCell>
      </Text>
    );
  });
});
