/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement, useMemo } from 'react';
import { type InstanceReference } from '../../data-providers';
import { isAssetInstance, isDmsInstance } from '../../data-providers/types';
import { useAssetsByIdsQuery } from '../../query';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { useDmInstancesByIds } from '../../query/useDmsInstanceByIdsQuery';
import { COGNITE_DESCRIBABLE_SOURCE } from '../../data-providers/core-dm-provider/dataModels';
import { HexagonIcon, Input } from '@cognite/cogs.js';

const nameableSources = [COGNITE_DESCRIBABLE_SOURCE];

export type AssetLabelProps = { instance: InstanceReference };

export const AssetLabel = ({ instance }: { instance: InstanceReference }): ReactElement => {
  const assetIds = useMemo(
    () => (isAssetInstance(instance) ? [{ id: instance.assetId }] : EMPTY_ARRAY),
    [instance]
  );

  const fdmIds = useMemo(() => (isDmsInstance(instance) ? [instance] : EMPTY_ARRAY), [instance]);

  const { data: assets } = useAssetsByIdsQuery(assetIds);
  const { data: fdmNodes } = useDmInstancesByIds(fdmIds, nameableSources);

  const labelText = useMemo(() => {
    if (assets === undefined && fdmNodes === undefined) {
      return undefined;
    }

    if (assets !== undefined && assets.length > 0) {
      return assets[0].name;
    }

    if (fdmNodes !== undefined && fdmNodes.length > 0) {
      return (
        fdmNodes[0].properties.cdf_cdm?.[
          `${COGNITE_DESCRIBABLE_SOURCE.externalId}/${COGNITE_DESCRIBABLE_SOURCE.version}`
        ]?.name ?? fdmNodes[0].externalId
      );
    }

    return 'Unknown';
  }, [assets, fdmNodes]);

  return <Input icon={<HexagonIcon />} value={labelText} disabled />;
};
