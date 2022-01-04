import React from 'react';
import { useDispatch } from 'react-redux';

import noop from 'lodash/noop';
import styled from 'styled-components/macro';

import { Collapse, Button } from '@cognite/cogs.js';

import { CollapseIcon } from 'components/icons/CollapseIcon';
import { updateCategoryCollapseKey } from 'modules/sidebar/actions';
import { useFilterActiveKeys } from 'modules/sidebar/selectors';
import { CategoryTypes } from 'modules/sidebar/types';
import { FlexColumn, FlexGrow, sizes } from 'styles/layout';

import { FilterTitle } from './FilterTitle';

const { Panel: DefaultPanel } = Collapse;

const Panel = styled(DefaultPanel)`
  /* Collapse in cogs.js isn't following cogs.js style (have to override temp.) */
  &:hover:not(.rc-collapse-item-active) {
    .rc-collapse-header h6 {
      transition: 250ms;
      color: var(--cogs-midblue-3);
    }
    .rc-collapse-header i {
      color: var(--cogs-midblue-3);
    }
  }
  &:hover.rc-collapse-item-active {
    .rc-collapse-header h6 {
      color: var(--cogs-greyscale-grey9);
    }
  }
  & > .rc-collapse-header {
    height: 52px;
    border-bottom: none !important;
    background: transparent !important;
    padding: 12px 16px !important;
  }
  & > .rc-collapse-anim {
    overflow: hidden !important;
  }
  & > .rc-collapse-content-active {
    border-top: 1px solid var(--cogs-color-strokes-default);
    background: transparent;
    padding: 0 16px !important;
    & > .rc-collapse-content-box {
      margin: 0;
      padding-top: ${sizes.normal};
      padding-bottom: ${sizes.extraSmall};
    }
  }
  border-top: none !important;
  margin: 10px 0;
  background-color: var(--cogs-greyscale-grey1);
  border-radius: 6px;
  min-width: 290px;
  width: fit-content;
`;

const Container = styled(FlexColumn)`
  justify-content: center;
  order: -1;
  margin-right: 8px;
`;

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
}
const FilterPanel = ({
  children,
  showApplyButton,
  handleApplyClick = noop,
  title,
  ...rest
}: FilterPanelProps) => {
  return (
    <Panel
      {...rest}
      header={
        <>
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
        </>
      }
      key={title && title.split(' ').join('-')}
    >
      {children}
    </Panel>
  );
};

FilterCollapse.Panel = FilterPanel;
