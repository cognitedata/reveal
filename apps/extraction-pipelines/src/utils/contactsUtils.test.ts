import { createUpdateSpec } from './contactsUtils';

describe('contactsUtils', () => {
  const spec = [
    { desc: 'Name', id: 2, fieldName: 'name', fieldValue: 'This is a test' },
    {
      desc: 'Description',
      id: 2,
      fieldName: 'description',
      fieldValue: 'This is the description',
    },
    {
      desc: 'Authors',
      id: 2,
      fieldName: 'authors',
      fieldValue: [{ name: 'aaa', email: 'aaa@test.no' }],
    },
    {
      desc: 'Not exists fieldName',
      id: 2,
      fieldName: 'thisDoesNotExist',
      fieldValue: 'This does not exist',
    },
  ];
  spec.forEach(({ desc, fieldValue, fieldName, id }) => {
    test(`createUpdateSpec - ${desc}`, () => {
      const res = createUpdateSpec({ id, fieldName, fieldValue });
      expect(res[0].update[`${fieldName}`]).toBeDefined();
      expect(res[0].update[`${fieldName}`].set).toEqual(fieldValue);
    });
  });
});
