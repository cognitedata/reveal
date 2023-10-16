import { SpaceDTO } from '../../providers/fdm-next';

import { CreateSpaceCommand } from './create-space-command';

describe('FetchDataModelQuery Test', () => {
  const spacesApiServiceMock = {
    upsert: jest
      .fn()
      .mockImplementation((dto: SpaceDTO) => Promise.resolve({ items: dto })),
  } as any;
  const createInstance = () => {
    return new CreateSpaceCommand(spacesApiServiceMock);
  };

  it('should create new space', async () => {
    const service = createInstance();
    const result = await service.execute({
      space: 'testSpace',
      name: 'testSpaceName',
    });
    const newSpace = result;

    expect(spacesApiServiceMock.upsert).toBeCalledWith([
      {
        space: 'testSpace',
        name: 'testSpaceName',
      },
    ]);
    expect(newSpace).toStrictEqual({
      space: 'testSpace',
      name: 'testSpaceName',
    });
  });
});
