import React from 'react';

import { WellId } from 'modules/wellSearch/types';

import { AddMultipleItems } from './AddMultipleItems';
import { AddSingleItem } from './AddSingleItem';

export interface Props {
  documentIds?: number[];
  wellIds?: WellId[];
  setFavored?: React.Dispatch<React.SetStateAction<boolean>>;
  parentCallBack?: () => void;
}

export const AddToFavoriteSetMenu: React.FC<Props> = ({
  documentIds = [],
  wellIds = [],
  parentCallBack,
}) => {
  if (documentIds.length === 1 || wellIds.length === 1) {
    return (
      <AddSingleItem
        documentId={documentIds[0]}
        wellId={wellIds[0]}
        callBackModal={parentCallBack}
      />
    );
  }

  return (
    <AddMultipleItems
      documentIds={documentIds}
      wellIds={wellIds}
      callBackModal={parentCallBack}
    />
  );
};
