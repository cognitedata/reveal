import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import sortBy from 'lodash/sortBy';

import { Table } from 'components/tablev3';
import { useMutateWellBorePatch } from 'modules/wellSearch/hooks/useQueryWellCard';
import { useWellBoreResult } from 'modules/wellSearch/selectors';
import { Wellbore, Well } from 'modules/wellSearch/types';
import {
  WellboreColumns,
  WellboreSubtableOptions,
} from 'pages/authorized/constant';
import { NO_WELLBORES_FOUND } from 'pages/authorized/search/well/content/constants';
import LoadingWellbores from 'pages/authorized/search/well/content/result/LoadingWellbores';
import { Message } from 'pages/authorized/search/well/content/result/WellBoreResultTable';

import { FavoriteWelboreResultsTableWrapper } from './elements';

export interface Props {
  well: Well;
}

const WellboreResult: React.FC<Props> = ({ well }) => {
  const wellbores = useWellBoreResult(well.id);
  const { mutate } = useMutateWellBorePatch([well.id]);
  const [isWellboresLoaded, setIsWellboresLoaded] = useState(false);

  const { t } = useTranslation('WellData');

  const [columns] = useState(WellboreColumns);
  const enableAllCheckboxes = false;

  useEffect(() => {
    const wellboresNotLoaded =
      well.id && !wellbores.length && !isWellboresLoaded;
    if (wellboresNotLoaded) {
      loadWellboresAndUpdateQuery();
      setIsWellboresLoaded(true);
    }
  }, [well, wellbores, isWellboresLoaded]);

  const loadWellboresAndUpdateQuery = () => mutate();

  const getSortedWellbores = (wellboreList: Wellbore[] | undefined) =>
    wellboreList ? sortBy(wellboreList, 'name') : [];

  const sortedWellbores = useMemo(
    () => getSortedWellbores(wellbores),
    [wellbores]
  );

  if (!wellbores.length) {
    return <LoadingWellbores />;
  }

  if (sortedWellbores.length === 0) {
    return <Message>{t(NO_WELLBORES_FOUND)}</Message>;
  }

  return (
    <FavoriteWelboreResultsTableWrapper>
      <Table<Wellbore>
        id="wellbore-result-table"
        data={sortedWellbores}
        columns={columns}
        options={WellboreSubtableOptions}
        checkIfCheckboxEnabled={() => enableAllCheckboxes}
      />
    </FavoriteWelboreResultsTableWrapper>
  );
};

export const FavoriteWellboreTable = React.memo(WellboreResult);
