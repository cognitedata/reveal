import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { Checkbox } from '@cognite/cogs.js';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';
import { wellInspectActions } from 'modules/wellInspect/actions';
import { useWellInspectWells } from 'modules/wellInspect/hooks/useWellInspect';
import {
  useColoredWellbores,
  useWellInspectIndeterminateWells,
  useWellInspectSelection,
} from 'modules/wellInspect/selectors';
import { Well } from 'modules/wellSearch/types';

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

export const Content: React.FC = () => {
  const wells = useWellInspectWells();
  const isColoredWellbores = useColoredWellbores();
  const { selectedWellIds, selectedWellboreIds } = useWellInspectSelection();
  const indeterminateWells = useWellInspectIndeterminateWells();

  const dispatch = useDispatch();

  const handleClickWell = useCallback((well: Well, isSelected: boolean) => {
    dispatch(wellInspectActions.toggleSelectedWell({ well, isSelected }));
  }, []);

  const handleClickWellbore = useCallback(
    (well: Well, wellboreId: number, isSelected: boolean) => {
      dispatch(
        wellInspectActions.toggleSelectedWellboreOfWell({
          well,
          wellboreId,
          isSelected,
        })
      );
    },
    []
  );

  return (
    <SidebarContent>
      {wells.map((well) => (
        <SidebarContentBlock key={well.id}>
          <BlockHeader>
            <Checkbox
              checked={selectedWellIds[well.id]}
              onChange={(isSelected) => handleClickWell(well, isSelected)}
              name={`sidebar-wellbore-${well.id}`}
              indeterminate={indeterminateWells[well.id]}
              color={DEFAULT_WELLBORE_COLOR}
            >
              <div>
                <WellLabel>Well</WellLabel>
                <WellLabelValue>{well.name}</WellLabelValue>
              </div>
            </Checkbox>
          </BlockHeader>

          <BlockContent>
            {well.wellbores.map((wellbore) => {
              const wellboreTitle =
                wellbore.description === wellbore.name
                  ? wellbore.name
                  : `${wellbore.description} ${wellbore.name}`;

              return (
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
                    checked={selectedWellboreIds[wellbore.id]}
                    onChange={(isSelected) =>
                      handleClickWellbore(well, wellbore.id, isSelected)
                    }
                    name={`sidebar-wellbore-${wellbore.id}`}
                    style={{ width: '100%' }}
                  >
                    <CheckboxContent>
                      <MiddleEllipsis value={wellboreTitle} />
                    </CheckboxContent>
                  </Checkbox>
                </BlockContentItem>
              );
            })}
          </BlockContent>
        </SidebarContentBlock>
      ))}
    </SidebarContent>
  );
};
