import { DeleteDataModelCommand } from './delete-data-model-command';

const dataModels = [
  {
    space: 'ABC',
    externalId: 'DM1',
    version: '1',
    createdTime: 1677323010547,
    lastUpdatedTime: 1677323060528,
    name: 'DM1',
    description: '',
    graphqlSchema:
      'type A {\n    name: String\n}\ntype B {\n    name: String\n}',
    views: [
      {
        type: 'view',
        space: 'ABC',
        externalId: 'A',
        version: '1',
      },
      {
        type: 'view',
        space: 'ABC',
        externalId: 'B',
        version: '1',
      },
    ],
  },
  {
    space: 'ABC',
    externalId: 'DM2',
    version: '1',
    createdTime: 1677323083652,
    lastUpdatedTime: 1677323108130,
    name: 'DM2',
    description: '',
    graphqlSchema:
      'type A {\n    name: String\n}\ntype B {\n    name: String\n}\ntype C {\n    name: String\n}',
    views: [
      {
        type: 'view',
        space: 'ABC',
        externalId: 'A',
        version: '1',
      },
      {
        type: 'view',
        space: 'ABC',
        externalId: 'B',
        version: '1',
      },
      {
        type: 'view',
        space: 'ABC',
        externalId: 'C',
        version: '1',
      },
    ],
  },
  {
    space: 'ABCD',
    externalId: 'DM3',
    version: '1',
    createdTime: 1677323123565,
    lastUpdatedTime: 1677323181388,
    name: 'DM3',
    description: '',
    graphqlSchema:
      'type A @view(space:"ABC") {\n    name: String\n}\n\ntype D {\n    name: String\n}',
    views: [
      {
        type: 'view',
        space: 'ABC',
        externalId: 'A',
        version: '1',
      },
      {
        type: 'view',
        space: 'ABCD',
        externalId: 'D',
        version: '1',
      },
    ],
  },
];

const dataModelsGetByIdsMock = jest.fn(
  (params: { items: { space: string; externalId: string }[] }) =>
    Promise.resolve({
      items: dataModels.filter((dm) =>
        params.items.some(
          (el) => el.externalId === dm.externalId && el.space === dm.space
        )
      ),
    })
);

const dataModelsListMock = jest.fn(() =>
  Promise.resolve({
    items: dataModels,
  })
);
const deleteDataModelMock = jest.fn((dto) => Promise.resolve({ items: dto }));

const dataModelsApiMock = {
  working: {
    getByIds: dataModelsGetByIdsMock,
    list: dataModelsListMock,
    delete: deleteDataModelMock,
  },
} as any;

const viewsApiMock = {
  working: {
    delete: jest.fn((dto) => Promise.resolve({ items: dto })),
  },
} as any;

const containersApiMock = {
  working: {
    delete: jest.fn((dto) => Promise.resolve({ items: dto })),
  },
} as any;

describe('DeleteDataModelCommand', () => {
  const createCommand = () => {
    return new DeleteDataModelCommand(
      dataModelsApiMock.working,
      viewsApiMock.working,
      containersApiMock.working
    );
  };

  test('delete data model - simple', async () => {
    const deleteCmd = createCommand();

    const response = await deleteCmd.execute(
      {
        space: 'ABCD',
        externalId: 'DM3',
      },
      true
    );
    // A and B are kept because they are imported in DM 1 and DM2
    expect(response.referencedViews).toEqual([
      {
        externalId: 'A',
        space: 'ABC',
        version: '1',
        dataModels: [
          expect.objectContaining({
            name: 'DM1',
          }),
          expect.objectContaining({
            name: 'DM2',
          }),
        ],
      },
    ]);
    expect(response.success).toBe(true);
  });
  test('delete data model - complex', async () => {
    const deleteCmd = createCommand();

    const response = await deleteCmd.execute(
      {
        space: 'ABC',
        externalId: 'DM2',
      },
      true
    );
    // A and B are kept because they are imported in DM 1 and DM3
    expect(response.referencedViews).toEqual([
      {
        externalId: 'A',
        space: 'ABC',
        version: '1',
        dataModels: [
          expect.objectContaining({
            name: 'DM1',
          }),
          expect.objectContaining({
            name: 'DM3',
          }),
        ],
      },
      {
        externalId: 'B',
        space: 'ABC',
        version: '1',
        dataModels: [
          expect.objectContaining({
            name: 'DM1',
          }),
        ],
      },
    ]);
    expect(response.success).toBe(true);
  });
  test('delete data model - complex - views check', async () => {
    const deleteCmd = createCommand();

    dataModelsListMock.mockImplementationOnce(async () =>
      Promise.resolve({
        items: dataModels.filter((el) => el.externalId !== 'DM1'),
      })
    );

    const responseA = await deleteCmd.execute(
      {
        space: 'ABC',
        externalId: 'DM2',
      },
      true
    );
    // A is kept because they are imported in DM3
    expect(responseA.referencedViews).toEqual(
      expect.objectContaining([
        {
          externalId: 'A',
          space: 'ABC',
          version: '1',
          dataModels: [
            expect.objectContaining({
              name: 'DM3',
            }),
          ],
        },
      ])
    );
    expect(responseA.success).toBe(true);

    dataModelsListMock.mockImplementationOnce(async () =>
      Promise.resolve({
        items: dataModels.filter(
          (el) => el.externalId !== 'DM1' && el.externalId !== 'DM3'
        ),
      })
    );

    const responseB = await deleteCmd.execute(
      {
        space: 'ABC',
        externalId: 'DM2',
      },
      true
    );
    // all views are deleted
    expect(responseB.referencedViews).toEqual([]);
    expect(responseB.success).toBe(true);
  });

  describe('autoPageToArray', () => {
    it('should fetch all items from a paginated API request', async () => {
      const items1 = [{ id: 1 }, { id: 2 }];
      const items2 = [{ id: 3 }, { id: 4 }];
      const items3 = [{ id: 5 }];
      const fn = jest.fn();
      fn.mockResolvedValueOnce({ items: items1, nextCursor: '1' });
      fn.mockResolvedValueOnce({ items: items2, nextCursor: '2' });
      fn.mockResolvedValueOnce({ items: items3 });

      const deleteCmd = new DeleteDataModelCommand(
        dataModelsApiMock.working,
        viewsApiMock.working,
        containersApiMock.working
      );
      const actualOutput = await deleteCmd['autoPageToArray'](fn);
      const expectedOutput = [...items1, ...items2, ...items3];
      expect(fn).toHaveBeenCalledTimes(3);
      expect(fn).toHaveBeenCalledWith(undefined);
      expect(fn).toHaveBeenCalledWith('1');
      expect(fn).toHaveBeenCalledWith('2');
      expect(actualOutput).toEqual(expectedOutput);
    });
  });
});
