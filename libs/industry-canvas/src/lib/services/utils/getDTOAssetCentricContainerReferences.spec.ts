import {
  AssetCentricContainerReference,
  ContainerReferenceType,
} from '../../types';

import { getDTOAssetCentricContainerReferences } from './getDTOAssetCentricContainerReferences';

describe('getDTOAssetCentricContainerReferences', () => {
  const mockCanvasExternalIdA = 'eid-a';
  const mockCanvasExternalIdB = 'eid-b';
  const containerId = '12';
  const containerType = ContainerReferenceType.TIMESERIES;

  const containerReferences: AssetCentricContainerReference[] = [
    {
      id: containerId,
      type: containerType,
      resourceId: 0,
      x: 0,
      y: 0,
    },
  ];

  const dtoAssetCentricContainersA = getDTOAssetCentricContainerReferences(
    containerReferences,
    mockCanvasExternalIdA,
    {}
  );
  const dtoAssetCentricContainersB = getDTOAssetCentricContainerReferences(
    containerReferences,
    mockCanvasExternalIdB,
    {}
  );

  it('Should same containers saved with different ids based on the id of the canvas they are in', () => {
    const dtoIdA = dtoAssetCentricContainersA[0].externalId;
    const dtoIdB = dtoAssetCentricContainersB[0].externalId;
    expect(dtoIdA).not.toEqual(dtoIdB);
  });

  it("Should throw error if container reference doesn't have a valid id", () => {
    const invalidContainerReferences: AssetCentricContainerReference[] = [
      {
        id: undefined,
        type: containerType,
        resourceId: 0,
        x: 0,
        y: 0,
      },
    ];
    expect(() => {
      getDTOAssetCentricContainerReferences(
        invalidContainerReferences,
        mockCanvasExternalIdA,
        {}
      );
    }).toThrow();
  });

  it('Should containers DTO get externalIds based on canvas externalId', () => {
    expect(dtoAssetCentricContainersA).toEqual([
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
        resourceId: 0,
        properties: {},
      },
    ]);
  });
});
