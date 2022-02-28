import { CogniteEvent } from '@cognite/sdk';

export const getDiameterHole = (event: CogniteEvent) => {
  const diameterHole = event.metadata?.diameter_hole;

  if (diameterHole === undefined) {
    return undefined;
  }

  return Number(diameterHole).toFixed(3);
};
