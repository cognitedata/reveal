import { getMockDocument } from '../../../../__test-utils/fixtures/document';
import { DocumentType } from '../../types';
import { detectDuplicates } from '../detectDuplicates';

const input: DocumentType[] = [
  getMockDocument(),
  getMockDocument(
    {
      filename: 'possible_duplicate.pdf', // real duplicate
      id: '123',
    },
    {
      filename: 'possible_duplicate.pdf',
      filesize: 100,
    }
  ),
  getMockDocument(
    {
      filename: 'not_a_duplicate.xlsx',
      id: '456',
    },
    {
      filename: 'not_a_duplicate.xlsx',
      filesize: 100,
    }
  ),
  getMockDocument(
    {
      filename: 'possible_duplicate.pdf', // real duplicate
      id: '789',
    },
    {
      filename: 'possible_duplicate.pdf',
      filesize: 100,
    }
  ),
  getMockDocument(
    {
      filename: 'possible_duplicate.pdf',
      id: '789',
    },
    {
      filename: 'possible_duplicate.pdf',
      filesize: 101,
    }
  ),
];

describe('Detect Duplicate Files', () => {
  it('should remove duplicates from the list', () => {
    expect(detectDuplicates(input).length).toEqual(4);
  });
});
