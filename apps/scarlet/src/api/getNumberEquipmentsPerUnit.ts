import { CogniteClient } from '@cognite/sdk';

import { getEquipmentsPerUnit } from '.';

export const getNumberEquipmentsPerUnit = async (
  client: CogniteClient,
  { externalIds }: { externalIds: string[] }
) => {
  const equipmentsPerUnit = await getEquipmentsPerUnit(client, { externalIds });

  return Object.keys(equipmentsPerUnit).reduce(
    (result, item: any) => ({
      ...result,
      [item]: equipmentsPerUnit[item].length,
    }),
    {}
  );
};
