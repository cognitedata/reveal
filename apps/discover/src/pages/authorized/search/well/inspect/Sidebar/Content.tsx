import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Checkbox } from '@cognite/cogs.js';

import { getMiddleEllipsisWrapper } from 'components/middle-ellipsis/MiddleEllipsis';
import Skeleton from 'components/skeleton';
import useSelector from 'hooks/useSelector';
import { useColoredWellbores } from 'modules/wellInspect/selectors';
import { wellSearchActions } from 'modules/wellSearch/actions';
import {
  useActiveWellsWellboresIds,
  useSelectedOrHoveredWells,
  useSelectedSecondaryWellAndWellboreIds,
} from 'modules/wellSearch/selectors';
import { Well } from 'modules/wellSearch/types';
import { toBooleanMap } from 'modules/wellSearch/utils';

import { DEFAULT_WELLBORE_COLOR } from './constants';
import {
  BlockContent,
  BlockContentItem,
  BlockHeader,
  CheckboxContent,
  SidebarContent,
  SidebarContentBlock,
  WellLabel,
  WellLabelValue,
} from './elements';

export const Content = () => {
  const [indeterminateIds, setIndeterminateIds] = useState<{
    [key: number]: boolean;
  }>({});

  const wells = useSelectedOrHoveredWells();
  const isColoredWellbores = useColoredWellbores();
  const { wellIds, wellboreIds } = useActiveWellsWellboresIds();
  const { selectedSecondaryWellIds, selectedSecondaryWellboreIds } =
    useSelectedSecondaryWellAndWellboreIds();

  const dispatch = useDispatch();

  const { allWellboresFetching } = useSelector((state) => state.wellSearch);

  const onWellClick = (well: Well) => {
    setIndeterminateIds((ids) => ({
      ...ids,
      [well.id]: false,
    }));
    setSelectedWellIds(
      {
        [well.id]: !selectedSecondaryWellIds[well.id],
      },
      false
    );
    if (well.wellbores) {
      setSelectedWellboreIds(
        toBooleanMap(
          well.wellbores.map((row) => row.id),
          !selectedSecondaryWellIds[well.id]
        )
      );
    }
  };

  const onWellboreClick = (wellboreId: number, well: Well) => {
    const newState = !selectedSecondaryWellboreIds[wellboreId];
    const wellWellboreIds = (well.wellbores || []).map((row) => row.id);
    const selectedIds = wellWellboreIds.filter(
      (row) =>
        (row === wellboreId && newState) ||
        (row !== wellboreId && selectedSecondaryWellboreIds[row])
    );
    setSelectedWellIds(
      {
        [well.id]: selectedIds.length > 0,
      },
      false
    );
    setIndeterminateIds((ids) => ({
      ...ids,
      [well.id]:
        selectedIds.length > 0 && selectedIds.length !== wellWellboreIds.length,
    }));
    setSelectedWellboreIds({
      [wellboreId]: newState,
    });
  };

  const setSelectedWellIds = useCallback((ids, reset) => {
    dispatch(wellSearchActions.setSelectedSecondaryWellIds(ids, reset));
  }, []);

  const setSelectedWellboreIds = useCallback((ids) => {
    dispatch(wellSearchActions.setSelectedSecondaryWellboreIds(ids));
  }, []);

  // Set all wells selected by default
  useEffect(() => {
    setSelectedWellIds(toBooleanMap(wellIds), true);
  }, [wellIds]);

  // Set all wellbores selected by default
  useEffect(() => {
    if (!allWellboresFetching) {
      setSelectedWellboreIds(toBooleanMap(wellboreIds));
    }
  }, [wellboreIds, allWellboresFetching]);

  return (
    <SidebarContent>
      {wells.map((well) => (
        <SidebarContentBlock key={well.id}>
          <BlockHeader>
            <Checkbox
              checked={selectedSecondaryWellIds[well.id]}
              onChange={() => onWellClick(well)}
              name={`sidebar-wellbore-${well.id}`}
              indeterminate={indeterminateIds[well.id]}
              color={DEFAULT_WELLBORE_COLOR}
            >
              <div>
                <WellLabel>Well</WellLabel>
                <WellLabelValue>{well.name}</WellLabelValue>
              </div>
            </Checkbox>
          </BlockHeader>

          <BlockContent>
            {allWellboresFetching ? (
              <Skeleton.List />
            ) : (
              well.wellbores.map((wellbore) => (
                <BlockContentItem
                  key={wellbore.id}
                  overlay={
                    isColoredWellbores && wellbore.metadata?.color.endsWith('_')
                  }
                >
                  <Checkbox
                    color={
                      isColoredWellbores
                        ? wellbore.metadata?.color.replace('_', '')
                        : DEFAULT_WELLBORE_COLOR
                    }
                    checked={selectedSecondaryWellboreIds[wellbore.id]}
                    onChange={() => {
                      onWellboreClick(wellbore.id, well);
                    }}
                    name={`sidebar-wellbore-${wellbore.id}`}
                  >
                    <CheckboxContent>
                      {getMiddleEllipsisWrapper(
                        `${wellbore.description} ${wellbore.name}`
                      )}
                    </CheckboxContent>
                  </Checkbox>
                </BlockContentItem>
              ))
            )}
          </BlockContent>
        </SidebarContentBlock>
      ))}
    </SidebarContent>
  );
};
