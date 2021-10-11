import React from 'react';

import { FavoriteBase } from './FavoriteBase';

interface Props {
  documentIds: number[];
  wellIds: number[];
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
