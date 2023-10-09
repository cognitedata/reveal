import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import isEqual from 'lodash/isEqual';

import { Body } from '@cognite/cogs.js';
import { LabelFilter as LabelFilterComp } from '@cognite/data-exploration';
import { Label } from '@cognite/sdk';

import { VisionFilterItemProps } from '../../types';
import { FilterAndOrOption } from '../FilterAndOrOption';

export const SelectLabelsFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => {
  const [anyAllState, setAnyAllState] = useState<'any' | 'all' | ''>('');

  const handleAnyAllOptionChange = (value: 'any' | 'all') => {
    setAnyAllState(value);
  };

  const setLabelFilter = (newFilterLabels?: Label[]) => {
    let labelFilter;
    if (newFilterLabels) {
      if (anyAllState === 'all') {
        labelFilter = { containsAll: newFilterLabels };
      } else {
        // set any as default
        labelFilter = { containsAny: newFilterLabels };
      }
    }
    if (!isEqual(filter.labels, labelFilter)) {
      setFilter({
        ...filter,
        labels: labelFilter,
      });
    }
  };

  useEffect(() => {
    const labelFilter = filter.labels as any;
    if (labelFilter?.containsAny?.length) {
      setAnyAllState('any');
    } else if (labelFilter?.containsAll?.length) {
      setAnyAllState('all');
    } else {
      setAnyAllState('');
    }
  }, [filter.labels]);

  useEffect(() => {
    setLabelFilter(
      (filter.labels as any)?.containsAll || (filter.labels as any)?.containsAny
    );
  }, [anyAllState]);

  return (
    <Container>
      <HeaderContainer>
        <Body level={4}>Labels</Body>
      </HeaderContainer>
      <FilterAndOrOption
        option={anyAllState}
        onOptionChange={handleAnyAllOptionChange}
      />
      <LabelFilterComp
        resourceType="file"
        value={
          (filter as any).labels?.containsAny ||
          (filter as any).labels?.containsAll ||
          []
        }
        setValue={setLabelFilter}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;

  span > .cogs-body-4.title {
    display: none; /* hide label filter title */
  }
`;
const HeaderContainer = styled.div`
  display: flex;
`;
