import { ListSpacesQuery } from './list-spaces-query';

describe('FetchDataModelQuery Test', () => {
  const spacesApiMock = {
    list: jest.fn().mockImplementation(() =>
      Promise.resolve({
        items: [{ space: 'test-space', name: 'Test_Space_Name' }],
      })
    ),
  } as any;
  const createInstance = () => {
    return new ListSpacesQuery(spacesApiMock);
  };

  describe('should fetch spaces', () => {
    test('sends correct payload', async () => {
      const service = createInstance();

      const spaces = await service.execute({});

      expect(spacesApiMock.list).toHaveBeenCalled();
      expect(spaces).toStrictEqual([
        { space: 'test-space', name: 'Test_Space_Name' },
      ]);
    });
  });
});
