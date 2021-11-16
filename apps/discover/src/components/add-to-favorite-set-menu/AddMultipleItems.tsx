import React from 'react';

import { WellId } from 'modules/wellSearch/types';

import { FavoriteBase } from './FavoriteBase';

interface Props {
  documentIds: number[];
  wellIds: WellId[];
  callBackModal?: () => void;
}

export const AddMultipleItems: React.FC<Props> = ({
  documentIds,
  wellIds,
  callBackModal,
}) => {
  return (
    <FavoriteBase
      documentIds={documentIds}
      wellIds={wellIds}
      callBackModal={callBackModal}
    />
  );
};
