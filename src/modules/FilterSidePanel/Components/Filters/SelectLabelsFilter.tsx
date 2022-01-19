import React, { useEffect, useState } from 'react';
import { LabelFilter as LabelFilterComp } from '@cognite/data-exploration';
import { VisionFilterItemProps } from 'src/modules/FilterSidePanel/types';
import styled from 'styled-components';
import { Body, Detail } from '@cognite/cogs.js';
import { Radio } from 'antd';
import { Label } from '@cognite/cdf-sdk-singleton';
import isEqual from 'lodash-es/isEqual';

export const SelectLabelsFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => {
  const [anyAllState, setAnyAllState] = useState('any');

  const handleAnyAllOptionChange = (value: string) => {
    setAnyAllState(value);
  };

  const setLabelFilter = (newFilterLabels?: Label[]) => {
    let labelFilter;
    if (newFilterLabels) {
      if (anyAllState === 'any') {
        labelFilter = { containsAny: newFilterLabels };
      } else {
        labelFilter = { containsAll: newFilterLabels };
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
      setAnyAllState('any');
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
      <RadioContainer>
        <Radio
          name="any"
          value="any"
          checked={anyAllState === 'any'}
          onChange={(evt) => handleAnyAllOptionChange(evt.target.value)}
          key="any"
        >
          {' '}
          <Detail>Or</Detail>
        </Radio>
        <Radio
          name="all"
          value="all"
          checked={anyAllState === 'all'}
          onChange={(evt) => handleAnyAllOptionChange(evt.target.value)}
          key="all"
        >
          {' '}
          <Detail>And</Detail>
        </Radio>
      </RadioContainer>
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
const RadioContainer = styled.div`
  display: flex;
  gap: 20px;
`;
