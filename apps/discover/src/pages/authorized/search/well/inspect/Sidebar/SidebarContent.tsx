import { useSidebarWells } from 'domain/wells/well/internal/hooks/useSidebarWells';
import { WellInternal } from 'domain/wells/well/internal/types';
import { DEFAULT_WELLBORE_COLOR } from 'domain/wells/wellbore/constants';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

import { Checkbox } from '@cognite/cogs.js';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';
import { useOverviewPageErrors } from 'modules/inspectTabs/selectors';
import { wellInspectActions } from 'modules/wellInspect/actions';
import {
  useColoredWellbores,
  useWellInspectIndeterminateWells,
  useWellInspectSelection,
} from 'modules/wellInspect/selectors';
import { WellboreId } from 'modules/wellSearch/types';
import { WellReportThreeDotsMenu } from 'pages/authorized/wellReportManager';

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
  const wells = useSidebarWells();

  const errors = useOverviewPageErrors();
  const isColoredWellbores = useColoredWellbores();
  const { selectedWellIds, selectedWellboreIds } = useWellInspectSelection();
  const indeterminateWells = useWellInspectIndeterminateWells();

  const dispatch = useDispatch();

  const handleClickWell = useCallback(
    (well: WellInternal, isSelected: boolean) => {
      dispatch(wellInspectActions.toggleSelectedWell({ well, isSelected }));
    },
    []
  );

  const handleClickWellbore = useCallback(
    (well: WellInternal, wellboreId: WellboreId, isSelected: boolean) => {
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
              const { name, title, color, id } = wellbore;
              const wellboreHasErrors = !isEmpty(errors[id]);
              const wellboreName = name || title;

              return (
                <BlockContentItem
                  data-testid="wellbore-selection-block"
                  key={id}
                >
                  <Checkbox
                    color={isColoredWellbores ? color : DEFAULT_WELLBORE_COLOR}
                    checked={selectedWellboreIds[id]}
                    onChange={(isSelected) =>
                      handleClickWellbore(well, id, isSelected)
                    }
                    name={`sidebar-wellbore-${id}`}
                    style={{ width: '100%' }}
                  >
                    <CheckboxContent>
                      <MiddleEllipsis value={wellboreName} />
                    </CheckboxContent>
                  </Checkbox>
                  {wellboreHasErrors && (
                    <WellboreErrorWarning errors={errors[id]} />
                  )}
                  <WellReportThreeDotsMenu
                    wellboreMatchingId={wellbore.matchingId}
                  />
                </BlockContentItem>
              );
            })}
          </BlockContent>
        </SidebarContentBlock>
      ))}
    </Content>
  );
};
