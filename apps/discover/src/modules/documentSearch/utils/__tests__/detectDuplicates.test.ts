import { getMockDocument } from '../../../../__test-utils/fixtures/document';
import { DocumentType } from '../../types';
import { detectDuplicates } from '../detectDuplicates';

const document1 = getMockDocument(
  {
    filename: 'abc.pdf',
    id: '123',
  },
  {
    filename: 'abc.pdf',
    creationdate: '23.08.2020',
    lastmodified: '23.08.2020',
    filesize: 100,
  }
);

const document2 = getMockDocument(
  {
    filename: 'abc.xlsx',
    id: '456',
  },
  {
    filename: 'abc.xlsx',
    creationdate: '23.08.2020',
    lastmodified: '23.08.2020',
    filesize: 100,
  }
);

const document3 = getMockDocument(
  {
    filename: 'abc.pdf',
    id: '789',
  },
  {
    filename: 'abc.pdf',
    creationdate: '23.08.2020',
    lastmodified: '23.08.2020',
    filesize: 100,
  }
);

const input: DocumentType[] = [document1, document2, document3];

describe('Detect Duplicate Files', () => {
  it('should mathc on filename, filesize and lastmodified', () => {
    const doc = detectDuplicates(input);
    expect(doc.length).toEqual(2);
  });
});
