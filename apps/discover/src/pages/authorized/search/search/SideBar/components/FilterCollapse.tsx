import * as React from 'react';
import { useDispatch } from 'react-redux';

import noop from 'lodash/noop';

import { Collapse, Button } from '@cognite/cogs.js';

import { CollapseIcon } from 'components/Icons/CollapseIcon';
import { updateCategoryCollapseKey } from 'modules/sidebar/actions';
import { useFilterActiveKeys } from 'modules/sidebar/selectors';
import { CategoryTypes } from 'modules/sidebar/types';
import { FlexGrow } from 'styles/layout';

import { Container, Panel } from './elements';
import { FilterTitle } from './FilterTitle';

interface FilterCollapseProps {
  children: React.ReactNode;
  category: CategoryTypes;
}
export const FilterCollapse = ({
  children,
  category,
  ...rest
}: FilterCollapseProps) => {
  const activeKeys = useFilterActiveKeys();
  const dispatch = useDispatch();

  return (
    <Collapse
      {...rest}
      activeKey={activeKeys[category]}
      onChange={(keys) => {
        dispatch(updateCategoryCollapseKey({ category, value: keys }));
      }}
      ghost
      expandIcon={CollapseIcon}
    >
      {children}
    </Collapse>
  );
};

interface FilterPanelProps {
  children: React.ReactNode;
  title: string;
  showApplyButton?: boolean;
  handleApplyClick?: () => void;
  headerTestId?: string;
}
const FilterPanel = ({
  children,
  showApplyButton,
  handleApplyClick = noop,
  headerTestId = '',
  title,
  ...rest
}: FilterPanelProps) => {
  return (
    <Panel
      {...rest}
      header={
        <div data-testid={headerTestId}>
          <Container>
            <FilterTitle title={title} />
          </Container>
          <FlexGrow />
          {showApplyButton && (
            <Button
              data-testid="filter-apply-btn"
              aria-label="Apply"
              onClick={(e) => {
                e.stopPropagation();
                handleApplyClick();
              }}
              type="ghost"
            >
              Apply
            </Button>
          )}
        </div>
      }
      key={title && title.split(' ').join('-')}
    >
      {children}
    </Panel>
  );
};

FilterCollapse.Panel = FilterPanel;
