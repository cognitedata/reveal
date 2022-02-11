import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import get from 'lodash/get';

import { Button, Dropdown, Icons, Menu } from '@cognite/cogs.js';

import { Tooltip } from 'components/tooltip';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { setCategoryPage } from 'modules/sidebar/actions';
import { FILTER_CATEGORIES } from 'modules/sidebar/constants';
import { useFilterCategory } from 'modules/sidebar/selectors';
import { CategoryTypes } from 'modules/sidebar/types';
import { FlexGrow } from 'styles/layout';

import { CategoryItem, CategoryMenu } from './elements';

export const CategorySwitch: React.FC = React.memo(() => {
  const metrics = useGlobalMetrics('filters');
  const [isOpen, setIsOpen] = useState(false);
  const { data: projectConfig } = useProjectConfig();
  const category = useFilterCategory();
  const dispatch = useDispatch();
  const history = useHistory();

  const selectCategory = (selected: string) => {
    if (selected !== category) {
      dispatch(setCategoryPage(selected as CategoryTypes));
      history.push(selected);
    }
    setIsOpen(false);
  };

  const categoryMenu = useMemo(
    () => (
      <CategoryMenu>
        <Menu.Header>Jump to</Menu.Header>

        {FILTER_CATEGORIES.filter(
          (row) => !get(projectConfig, `${row.module}.disabled`)
        ).map((row) => (
          <CategoryItem
            key={row.name}
            selected={row.name === category}
            onClick={() => {
              metrics.track(`click-${row.name}-filter-category-dropdown`);
              selectCategory(row.name);
            }}
          >
            {row.title}
            <FlexGrow />
            {row.name === category && (
              <div data-testid="svg-wrapper">
                <Icons.Checkmark />
              </div>
            )}
          </CategoryItem>
        ))}
      </CategoryMenu>
    ),
    [projectConfig, category]
  );

  const renderDropdownContent = useMemo(
    () => (
      <Dropdown
        content={categoryMenu}
        placement="bottom-start"
        appendTo={document.body}
        visible={isOpen}
        onClickOutside={() => {
          metrics.track('click-close-filter-category-dropdown');
          setIsOpen(false);
        }}
      >
        <Tooltip title="Filter categories" enabled={!isOpen}>
          <Button
            type="ghost"
            icon={isOpen ? 'ChevronUp' : 'ChevronDown'}
            aria-label="Filter Categories"
            onClick={() => {
              metrics.track(
                `click-${isOpen ? 'close' : 'open'}-filter-category-dropdown`
              );
              setIsOpen(!isOpen);
            }}
          />
        </Tooltip>
      </Dropdown>
    ),
    [isOpen]
  );

  return <> {renderDropdownContent} </>;
});
