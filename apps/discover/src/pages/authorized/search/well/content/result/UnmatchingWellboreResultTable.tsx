import { WellInternal } from 'domain/wells/well/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Row } from 'react-table';

import isEmpty from 'lodash/isEmpty';

import { Icon, Tooltip } from '@cognite/cogs.js';

import { ColumnType, RowProps, Table } from 'components/Tablev3';
import { useDeepCallback } from 'hooks/useDeep';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellboresOfWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { useWells } from 'modules/wellSearch/selectors';
import { WellboreSubtableOptions } from 'pages/authorized/constant';

import {
  ExpandCollapseIcon,
  OtherWellboresRow,
  OtherWellboresSectionHeader,
  TooltipContainer,
  Message,
} from './elements';

export interface UnmatchingWellboreResultTableProps {
  well: WellInternal;
  matchingWellbores: WellboreInternal[];
  visibleWellboreColumns: ColumnType<WellboreInternal>[];
  renderRowOverlayComponent: ({
    row,
  }: {
    row: Row<WellboreInternal>;
  }) => JSX.Element | null;
  renderHoverRowSubComponent: ({
    row,
  }: {
    row: Row<WellboreInternal>;
  }) => JSX.Element;
}

const EMPTY_NOT_MATCHING_WELLBORES_TOOLTIP = 'Not meeting criteria';

const EMPTY_NOT_MATCHING_WELLBORES_MESSAGE =
  'All wellbores are meeting criteria';

const OTHER_WELLBORES_SECTION_TITLE = 'Other wellbores';

const UnmatchingWellboreResultTable: React.FC<
  UnmatchingWellboreResultTableProps
> = ({
  well,
  matchingWellbores,
  visibleWellboreColumns,
  renderRowOverlayComponent,
  renderHoverRowSubComponent,
}) => {
  const [unmatchingWellboresExpanded, setUnmatchingWellboresExpanded] =
    useState<boolean>(false);
  // const [selectedWellbores, setSelectedWellbores] = useState<TableResults>({});
  const allWellbores = useWellboresOfWellById(well.id);
  const { selectedWellboreIds } = useWells();
  const dispatch = useDispatch();

  const matchingWellboreIds = useMemo(
    () => matchingWellbores.map((wellbore) => wellbore.id),
    [matchingWellbores]
  );

  const unmatchingWellbores = useMemo(
    () =>
      allWellbores.filter(
        (wellbore) => !matchingWellboreIds.includes(wellbore.id)
      ),
    [allWellbores, matchingWellboreIds]
  );

  const handleExpandUnmatchingWellbores = () => {
    setUnmatchingWellboresExpanded((current) => !current);
  };

  const handleRowSelect = useDeepCallback(
    (row: RowProps<WellboreInternal>, isSelected: boolean) => {
      dispatch(
        wellSearchActions.toggleSelectedWellboreOfWell({
          well: {
            ...well,
            wellbores: allWellbores,
          },
          wellboreId: row.original.id,
          isSelected,
        })
      );
    },
    [allWellbores]
  );

  return (
    <>
      <OtherWellboresRow>
        <ExpandCollapseIcon>
          <Icon
            type={unmatchingWellboresExpanded ? 'ChevronUp' : 'ChevronDown'}
            onClick={handleExpandUnmatchingWellbores}
          />
        </ExpandCollapseIcon>
        <OtherWellboresSectionHeader>
          {OTHER_WELLBORES_SECTION_TITLE}
          <TooltipContainer>
            <Tooltip content={EMPTY_NOT_MATCHING_WELLBORES_TOOLTIP}>
              <Icon type="Info" />
            </Tooltip>
          </TooltipContainer>
        </OtherWellboresSectionHeader>
      </OtherWellboresRow>
      {unmatchingWellboresExpanded && isEmpty(unmatchingWellbores) && (
        <OtherWellboresRow>
          <Message>{EMPTY_NOT_MATCHING_WELLBORES_MESSAGE}</Message>
        </OtherWellboresRow>
      )}
      {unmatchingWellboresExpanded && (
        <Table<WellboreInternal>
          id="unmatching-wellbore-result-table"
          indent
          data={unmatchingWellbores}
          columns={visibleWellboreColumns}
          handleRowSelect={handleRowSelect}
          options={WellboreSubtableOptions}
          selectedIds={selectedWellboreIds}
          renderRowOverlayComponent={renderRowOverlayComponent}
          renderRowHoverComponent={renderHoverRowSubComponent}
          hideHeaders
        />
      )}
    </>
  );
};

export default UnmatchingWellboreResultTable;
