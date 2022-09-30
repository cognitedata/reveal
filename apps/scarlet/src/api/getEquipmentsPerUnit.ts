import { CogniteClient } from '@cognite/sdk';
import { DataSetId } from 'types';

export const getEquipmentsPerUnit = async (
  client: CogniteClient,
  { externalIds }: { externalIds: string[] }
) => {
  if (!externalIds?.length) throw Error('Unit ids are not set');

  const equipmentsPerUnit: Record<string, string[]> = externalIds.reduce(
    (result, item) => ({ ...result, [item]: [] }),
    {}
  );

  let list = await client.assets.list({
    filter: {
      dataSetIds: [{ id: DataSetId.P66_PCMS }],
      parentExternalIds: externalIds.map((id) => `Equipments_${id}`),
      labels: { containsAll: [{ externalId: 'Equipment' }] },
    },
    limit: 1000,
  });

  let next;

  do {
    if (next) list = await next(); // eslint-disable-line no-await-in-loop
    list.items
      .filter((item) => /^\d+-/.test(item.name))
      .forEach((item) => {
        if (!item.parentExternalId) return;
        const key = item.parentExternalId.replace('Equipments_', '');
        equipmentsPerUnit[key].push(item.name);
      });
    next = list.next;
  } while (list.next);

  return equipmentsPerUnit;
};
