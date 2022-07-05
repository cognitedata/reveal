import { CogniteClient } from '@cognite/sdk';

import { getEquipmentsPerUnit } from '.';

export const getNumberEquipmentsPerUnit = async (
  client: CogniteClient,
  { unitIds }: { unitIds: number[] }
) => {
  const equipmentsPerUnit = await getEquipmentsPerUnit(client, { unitIds });

  return Object.keys(equipmentsPerUnit).reduce(
    (result, item: any) => ({
      ...result,
      [item]: equipmentsPerUnit[item].length,
    }),
    {}
  );
};
