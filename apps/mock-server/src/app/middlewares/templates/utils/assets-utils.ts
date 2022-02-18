import { CdfMockDatabase, CdfResourceObject } from '../../../types';
import { CdfDatabaseService } from '../../../common/cdf-database.service';
import { filterCollection, objToFilter } from '../../../utils';

export const findAssetParent = (
  parentExternalId: string,
  db: CdfMockDatabase
): CdfResourceObject => {
  const linkedData = CdfDatabaseService.from(db, 'assets').getState();
  const items = filterCollection(
    linkedData,
    objToFilter({ externalId: parentExternalId })
  ) as CdfResourceObject[];
  return items.length ? items[0] : null;
};

export const findAssetRoot = (
  parentExternalId: string,
  db: CdfMockDatabase
) => {
  let assetParentExternalId = parentExternalId;
  let externalId;

  while (assetParentExternalId) {
    const parent = findAssetParent(assetParentExternalId, db);

    if (!parent || !parent.parentExternalId) {
      externalId = assetParentExternalId;
    }
    assetParentExternalId = parent.parentExternalId as string;
  }
  const root = findAssetParent(externalId, db);

  return root;
};
