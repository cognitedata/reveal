import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

import { Checkbox } from '@cognite/cogs.js';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';
import { useOverviewPageErrors } from 'modules/inspectTabs/selectors';
import { wellInspectActions } from 'modules/wellInspect/actions';
import { useWellInspectWells } from 'modules/wellInspect/hooks/useWellInspect';
import {
  useColoredWellbores,
  useWellInspectIndeterminateWells,
  useWellInspectSelection,
} from 'modules/wellInspect/selectors';
import { Well } from 'modules/wellSearch/types';

import { DEFAULT_WELLBORE_COLOR } from './constants';
import { wellboreAdapter } from './domain';
import {
  BlockContent,
  BlockContentItem,
  BlockHeader,
  CheckboxContent,
  Content,
  SidebarContentBlock,
  WellLabel,
  WellLabelValue,
} from './elements';
import { WellboreErrorWarning } from './WellboreErrorWarning';

export const SidebarContent: React.FC = () => {
  const wells = useWellInspectWells();
  const errors = useOverviewPageErrors();
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
    <Content>
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
              const { title, color, id } = wellboreAdapter(
                wellbore,
                isColoredWellbores
              );
              const wellboreHasErrors = !isEmpty(errors[id]);

              return (
                <BlockContentItem
                  data-testid="wellbore-selection-block"
                  key={id}
                >
                  <Checkbox
                    color={color}
                    checked={selectedWellboreIds[id]}
                    onChange={(isSelected) =>
                      handleClickWellbore(well, id, isSelected)
                    }
                    name={`sidebar-wellbore-${id}`}
                    style={{ width: '100%' }}
                  >
                    <CheckboxContent>
                      <MiddleEllipsis value={title} />
                    </CheckboxContent>
                  </Checkbox>
                  {wellboreHasErrors && (
                    <WellboreErrorWarning errors={errors[id]} />
                  )}
                </BlockContentItem>
              );
            })}
          </BlockContent>
        </SidebarContentBlock>
      ))}
    </Content>
  );
};
