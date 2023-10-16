import { SpaceDTO } from '../../providers/fdm-next';

import { DeleteInstancesCommand } from './delete-instances-command';
import { DeleteInstancesDTO } from './dto';

describe('DeleteInstancesCommand Test', () => {
  const itemsMock = [
    { externalId: 'item1', space: 'space1' },
    { externalId: 'item2', space: 'space2' },
  ];
  const dtoMock = {
    items: itemsMock,
    type: 'node',
    space: 'testSpace',
    dataModelExternalId: 'testSpaceName',
  } as DeleteInstancesDTO;

  const instancesApiServiceMock = {
    delete: jest
      .fn()
      .mockImplementation((dto: SpaceDTO) =>
        Promise.resolve({ items: itemsMock })
      ),
  } as any;

  const createInstance = () => {
    return new DeleteInstancesCommand(instancesApiServiceMock);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if no items are selected', async () => {
    const command = createInstance();
    await expect(
      command.execute({
        items: [],
        type: 'node',
        space: 'testSpace',
        dataModelExternalId: 'testSpaceName',
      })
    ).rejects.toEqual('No rows selected!');
  });

  it('should delete selected items', async () => {
    const command = createInstance();

    await command.execute(dtoMock);
    expect(instancesApiServiceMock.delete).toHaveBeenCalledWith({
      items: itemsMock.map((item) => ({
        externalId: item.externalId,
        instanceType: dtoMock.type,
        space: item.space,
      })),
    });
  });
  it('should delete edges', async () => {
    const command = createInstance();

    await command.execute({ ...dtoMock, type: 'edge' });
    expect(instancesApiServiceMock.delete).toHaveBeenCalledWith({
      items: itemsMock.map((item) => ({
        externalId: item.externalId,
        instanceType: 'edge',
        space: item.space,
      })),
    });
  });
  it('should delete selected items', async () => {
    const command = createInstance();

    await command.execute(dtoMock);
    expect(instancesApiServiceMock.delete).toHaveBeenCalledWith({
      items: itemsMock.map((item) => ({
        externalId: item.externalId,
        instanceType: dtoMock.type,
        space: item.space,
      })),
    });
  });

  it('should throw error if not all items are deleted', async () => {
    const command = createInstance();

    instancesApiServiceMock.delete.mockResolvedValueOnce({
      items: [itemsMock[0]],
    });
    await expect(command.execute(dtoMock)).rejects.toEqual(
      'Only 1/2 of the selected rows are deleted.'
    );
  });

  it('should return true if all items are deleted', async () => {
    const command = createInstance();

    instancesApiServiceMock.delete.mockResolvedValueOnce({ items: itemsMock });
    const result = await command.execute(dtoMock);
    expect(result).toBe(true);
  });
});
