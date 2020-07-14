import {
  getCategoryByDocumentId,
  getDocumentsByCategory,
  getKeyAndDescription,
  getKeyList,
  getShortDescription,
} from '../utils';
// @ts-ignore-next-line
import docs from './files.json';

it('Should return title not longer then 56 characters', () => {
  const result = getShortDescription(
    'Test Title Test Title Test Title Test Title Test Title Test Title Test'
  );
  expect(result).toEqual(
    'Test Title Test Title Test Title Test Title Test Title T...'
  );
});

describe('GetKeyList', () => {
  it('Should return a list of keys parsed from the file name', () => {
    const keyList1 = getKeyList(docs[0]);
    const keyList2 = getKeyList(docs[1]);
    expect(keyList1).toEqual([
      '',
      'DN02',
      'S00212',
      'E',
      'XK',
      '0004',
      '00.PDF',
    ]);
    expect(keyList2).toEqual([
      '',
      'SKA',
      'AK',
      'ER252',
      'R',
      'XB',
      '0001',
      '001.PDF',
    ]);
  });
});

describe('GetKeyAndDescription', () => {
  it('Should return key (category) and description for the doc', () => {
    const keyAndDescription1 = getKeyAndDescription(docs[0]);
    const keyAndDescription2 = getKeyAndDescription(docs[1]);
    expect(keyAndDescription1.key).toEqual('XK');
    expect(keyAndDescription2.key).toEqual('XB');
    expect(keyAndDescription1.description).toEqual('Circuit diagrams');
    expect(keyAndDescription2.description).toEqual('P&ID');
  });
});

describe('ListDocsInCategories', () => {
  it('Should return an object with doctype as key for descriptions and arry of documents ', () => {
    const result = getDocumentsByCategory(docs);
    expect(result).toHaveProperty('XK');
    expect(result).toHaveProperty('XJ');
    expect(result.XK.documents).toHaveLength(4);
    expect(result.XJ.documents).toHaveLength(1);
    expect(result.XJ.description).toEqual('Single line diagrams');
    expect(result.XK.description).toEqual('Circuit diagrams');
  });
});

describe('GetCategoryByDocumentId', () => {
  it('Should return an object with doc id as key for description, category, and document', () => {
    const result = getCategoryByDocumentId(docs);
    expect(result).toHaveProperty('2957348359082423');
    expect(result).toHaveProperty('3989986174219268');
    expect(result[2957348359082423].category).toEqual('XK');
    expect(result[3989986174219268].category).toEqual('XJ');
    expect(result[2957348359082423].description).toEqual('Circuit diagrams');
    expect(result[3989986174219268].description).toEqual(
      'Single line diagrams'
    );
    expect(result[2957348359082423].document.id).toEqual(2957348359082423);
    expect(result[3989986174219268].document.id).toEqual(3989986174219268);
  });
});
