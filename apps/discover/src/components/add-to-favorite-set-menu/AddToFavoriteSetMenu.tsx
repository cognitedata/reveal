import React from 'react';

import head from 'lodash/head';

import { WellboreId, WellId } from 'modules/wellSearch/types';

import { AddMultipleItems } from './AddMultipleItems';
import { AddSingleItem } from './AddSingleItem';

export interface Props {
  documentIds?: number[];
  wellIds?: WellId[];
  wellboreIds?: WellboreId[];
  setFavored?: React.Dispatch<React.SetStateAction<boolean>>;
  parentCallBack?: () => void;
}

export const AddToFavoriteSetMenu: React.FC<Props> = ({
  documentIds = [],
  wellIds = [],
  wellboreIds = [],
  parentCallBack,
}) => {
  if (documentIds.length === 1 || wellIds.length === 1) {
    return (
      <AddSingleItem
        /*
        documentIds cannot go with lodash head -
        head returns a number or undefined, undefined cannot assignable to a number
        */
        documentId={documentIds[0]}
        wellId={head(wellIds)}
        wellboreId={head(wellboreIds)}
        callBackModal={parentCallBack}
      />
    );
  }

  return (
    <AddMultipleItems
      documentIds={documentIds}
      wellIds={wellIds}
      wellboreIds={wellboreIds}
      callBackModal={parentCallBack}
    />
  );
};
