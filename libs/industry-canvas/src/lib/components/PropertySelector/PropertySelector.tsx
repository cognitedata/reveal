import React, { useCallback, useState } from 'react';

import styled from 'styled-components';

import {
  Body,
  Button,
  Checkbox,
  Colors,
  Elevations,
  InputExp,
} from '@cognite/cogs.js';

import { translationKeys } from '../../common/i18n/translationKeys';
import { useTranslation } from '../../hooks/useTranslation';

import usePropertiesState from './hooks/usePropertiesState';
import ReorderablePropertyList from './ReorderablePropertyList';
import { PropertiesList, Property } from './types';
import { filterCommonProperties, filterDistinctProperties } from './utils';

export type PropertySelectorProps = {
  propertiesList: PropertiesList;
  onApplyClick: ({
    properties,
    shouldApplyToAll,
  }: {
    properties: Property[];
    shouldApplyToAll: boolean;
  }) => void;
};

const PropertySelector: React.FC<PropertySelectorProps> = ({
  onApplyClick,
  propertiesList,
}) => {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState('');
  const [shouldApplyToAll, setShouldApplyToAll] = useState(false);

  const {
    properties: common,
    filteredProperties: filteredCommon,
    onDragEnd: onDragEndCommon,
    onSelect: onSelectCommon,
  } = usePropertiesState(filterCommonProperties(propertiesList), searchInput);
  const {
    properties: distinct,
    filteredProperties: filteredDistinct,
    onDragEnd: onDragEndDistinct,
    onSelect: onSelectDistinct,
  } = usePropertiesState(filterDistinctProperties(propertiesList), searchInput);

  const handleApplyClick = useCallback(() => {
    const selectedProperties = [...common, ...distinct].filter(
      (property) => property.isSelected
    );

    onApplyClick({ properties: selectedProperties, shouldApplyToAll });
  }, [common, distinct, onApplyClick, shouldApplyToAll]);

  const areBothCommonAndDistinctPropertiesAvailable =
    common.length > 0 && distinct.length > 0;

  const numSelected = [...common, ...distinct].filter(
    (property) => property.isSelected
  ).length;

  return (
    <Container>
      <SearchInputContainer>
        <SearchInput
          placeholder="Search"
          variant="solid"
          fullWidth
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </SearchInputContainer>
      <OverflowContainer>
        <ReorderablePropertyList
          id="common"
          onDragEnd={onDragEndCommon}
          properties={filteredCommon}
          onSelect={onSelectCommon}
        />
        {areBothCommonAndDistinctPropertiesAvailable && <Divider />}
        <ReorderablePropertyList
          id="distinct"
          onDragEnd={onDragEndDistinct}
          properties={filteredDistinct}
          onSelect={onSelectDistinct}
        />
      </OverflowContainer>

      <ApplyContainer>
        <StyledCheckbox
          checked={shouldApplyToAll}
          onChange={() => setShouldApplyToAll((prevState) => !prevState)}
        >
          <Body size="medium" color={Colors['text-icon--strong']}>
            {t(
              translationKeys.TOOLTIP_PROPERTY_SELECTOR_APPLY_TO_ALL_OF_SAME_TYPE,
              'Apply to all of same type'
            )}
          </Body>
        </StyledCheckbox>

        <Button
          type="primary"
          size="medium"
          aria-label={t(translationKeys.TOOLTIP_PROPERTY_SELECTOR_APPLY, {
            numSelected,
            defaultValue: 'Apply ({{numSelected}})',
          })}
          onClick={handleApplyClick}
        >
          {t(translationKeys.TOOLTIP_PROPERTY_SELECTOR_APPLY, {
            numSelected,
            defaultValue: 'Apply ({{numSelected}})',
          })}
        </Button>
      </ApplyContainer>
    </Container>
  );
};

const SearchInputContainer = styled.div`
  padding: 8px;
`;

const SearchInput = styled(InputExp)``;

const StyledCheckbox = styled(Checkbox)`
  padding: 8px;
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${Colors['border--muted']};
  margin: 8px 0;
`;

const OverflowContainer = styled.div`
  overflow: auto;
  overflow-y: scroll;
  flex-grow: 1;
  scrollbar-width: thin;
  padding: 8px;
`;

const ApplyContainer = styled.div`
  box-shadow: ${Elevations['elevation--overlay']};
  align-items: stretch;
  flex-direction: column;
  display: flex;
  padding: 0px 8px 8px 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  height: 437px;
  border-radius: 8px;
  box-shadow: ${Elevations['elevation--overlay']};
  background-color: ${Colors['surface--muted']};
`;

export default PropertySelector;
