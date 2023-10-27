import { useMemo, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Button, Divider, Dropdown, Menu } from '@cognite/cogs.js';

import { ThreeDSearchCategories } from '../search/ThreeDSearchCategories';

export type FilterValues = 'all' | 'mapped';

export type ThreeDSearchCategoriesProps = {
  onFilterChanged?: (value: FilterValues) => void;
  displayOnlyMapped3dData?: boolean;
};

export const ThreeDSearchTopBar = ({
  onFilterChanged,
  displayOnlyMapped3dData,
}: ThreeDSearchCategoriesProps) => {
  return (
    <Container>
      <ThreeDSearchCategories
        displayOnlyMapped3dData={displayOnlyMapped3dData}
      />
      <Divider direction="vertical" weight="2px" spacing="16px" length="16px" />
      <ThreeDFilterSelector
        onFilterChanged={onFilterChanged}
        displayOnlyMapped3dData={displayOnlyMapped3dData}
      />
    </Container>
  );
};

const ThreeDFilterSelector = ({
  onFilterChanged,
  displayOnlyMapped3dData,
}: ThreeDSearchCategoriesProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const options = useMemo<
    { value: FilterValues; label: string; helpText: string }[]
  >(
    () => [
      {
        value: 'all',
        label: t('SEARCH_RESULTS_3D_FILTER_ALL_OPTION'),
        helpText: t('SEARCH_RESULTS_3D_FILTER_ALL_OPTION_DESCRIPTION'),
      },
      {
        value: 'mapped',
        label: t('SEARCH_RESULTS_3D_FILTER_MAPPED_OPTION'),
        helpText: t('SEARCH_RESULTS_3D_FILTER_MAPPED_OPTION_DESCRIPTION'),
      },
    ],
    [t]
  );

  return (
    <Dropdown
      visible={isMenuOpen}
      onClickOutside={() => setIsMenuOpen(false)}
      content={
        <Menu>
          {options.map((option) => (
            <Menu.Item
              key={option.value}
              toggled={displayOnlyMapped3dData === (option.value === 'mapped')}
              onClick={() => {
                onFilterChanged?.(option.value);
                setIsMenuOpen(false);
              }}
              description={option.helpText}
            >
              {option.label}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <StyledButton
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        type="secondary"
        icon="List"
      >
        {displayOnlyMapped3dData ? options[1].label : options[0].label}
      </StyledButton>
    </Dropdown>
  );
};

const Container = styled.div`
  padding-top: 16px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`;

const StyledButton = styled(Button).attrs({
  style: { justifyContent: 'flex-start' },
})`
  width: 150px;
`;
