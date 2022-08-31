import { getFieldValue } from './fieldUtils';

describe('TaskList', () => {
  test.only('Gets filed value', () => {
    const object = { name: 'some name', externalId: 'external_id' };
    const res = getFieldValue('externalId', object);
    expect(res).toEqual(object.externalId);
  });
});
