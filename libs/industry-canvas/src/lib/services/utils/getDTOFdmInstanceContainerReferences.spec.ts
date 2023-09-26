import {
  FdmInstanceContainerReference,
  ContainerReferenceType,
} from '../../types';

import { getDTOFdmInstanceContainerReferences } from './getDTOFdmInstanceContainerReferences';

describe('getDTOFdmInstanceContainerReferences', () => {
  const mockCanvasExternalIdA = 'eid-A';
  const mockCanvasExternalIdB = 'eid-B';
  const containerId = '12';
  const containerType = ContainerReferenceType.FDM_INSTANCE;

  const containerReferences: FdmInstanceContainerReference[] = [
    {
      id: containerId,
      type: containerType,
      instanceExternalId: '',
      instanceSpace: '',
      viewExternalId: '',
      viewSpace: '',
      x: 0,
      y: 0,
    },
  ];

  const dtoFdmInstanceContainersA = getDTOFdmInstanceContainerReferences(
    containerReferences,
    mockCanvasExternalIdA,
    {}
  );
  const dtoFdmInstanceContainersB = getDTOFdmInstanceContainerReferences(
    containerReferences,
    mockCanvasExternalIdB,
    {}
  );

  it('Should same fdm instance containers saved with different ids based on the id of the canvas they are in', () => {
    const dtoIdA = dtoFdmInstanceContainersA[0].externalId;
    const dtoIdB = dtoFdmInstanceContainersB[0].externalId;
    expect(dtoIdA).not.toEqual(dtoIdB);
  });

  it("Should throw error if container reference doesn't have a valid id", () => {
    const invalidContainerReferences: FdmInstanceContainerReference[] = [
      {
        id: undefined,
        type: containerType,
        instanceExternalId: '',
        instanceSpace: '',
        viewExternalId: '',
        viewSpace: '',
        x: 0,
        y: 0,
      },
    ];
    expect(() => {
      getDTOFdmInstanceContainerReferences(
        invalidContainerReferences,
        mockCanvasExternalIdA,
        {}
      );
    }).toThrow();
  });

  it('Should fdm containers DTO get externalIds based on canvas externalId', () => {
    expect(dtoFdmInstanceContainersA).toEqual([
      {
        externalId: `${mockCanvasExternalIdA}_${containerId}`,
        id: containerId,
        containerReferenceType: containerType,
        label: undefined,
        x: 0,
        y: 0,
        width: undefined,
        height: undefined,
        maxWidth: undefined,
        maxHeight: undefined,
        instanceExternalId: '',
        instanceSpace: '',
        viewExternalId: '',
        viewSpace: '',
        viewVersion: undefined,
        properties: {},
      },
    ]);
  });
});
