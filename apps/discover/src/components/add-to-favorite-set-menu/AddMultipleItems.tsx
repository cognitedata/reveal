import React from 'react';

import { WellboreId, WellId } from 'modules/wellSearch/types';

import { FavoriteBase } from './FavoriteBase';

interface Props {
  documentIds: number[];
  wellIds: WellId[];
  wellboreIds?: WellboreId[];
  callBackModal?: () => void;
}

export const AddMultipleItems: React.FC<Props> = ({
  documentIds,
  wellIds,
  wellboreIds,
  callBackModal,
}) => {
  return (
    <FavoriteBase
      documentIds={documentIds}
      wellIds={wellIds}
      wellboreIds={wellboreIds}
      callBackModal={callBackModal}
    />
  );
};
