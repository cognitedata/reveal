import { CogniteClient } from '@cognite/sdk';
import { DataSetId } from 'types';

export const getEquipmentsPerUnit = async (
  client: CogniteClient,
  { unitIds }: { unitIds: number[] }
) => {
  if (!unitIds?.length) throw Error('Unit ids are not set');

  const equipmentsPerUnit: Record<number, string[]> = unitIds.reduce(
    (result, item) => ({ ...result, [item]: [] }),
    {}
  );

  let list = await client.assets.list({
    filter: {
      externalIdPrefix: 'Equip',
      dataSetIds: [{ id: DataSetId.PCMS }],
      parentIds: unitIds,
    },
    limit: 1000,
  });

  let next;

  do {
    if (next) list = await next(); // eslint-disable-line no-await-in-loop
    list.items
      .filter((item) => /^\d+-/.test(item.name))
      .forEach((item) => {
        if (!equipmentsPerUnit[item.parentId!].includes(item.name)) {
          equipmentsPerUnit[item.parentId!].push(item.name);
        }
      });
    next = list.next;
  } while (list.next);

  return equipmentsPerUnit;
};
