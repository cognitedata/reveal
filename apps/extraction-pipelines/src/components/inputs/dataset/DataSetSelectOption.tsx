import { components, OptionProps, OptionTypeBase } from 'react-select';
import { Colors } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'common';

export const DataSetSelectOption = ({
  isDisabled,
  data: option,
  ...rest
}: OptionProps<OptionTypeBase, boolean>) => {
  const { t } = useTranslation();

  return (
    <>
      {!isDisabled ? (
        <OptionWrapper
          className="cogs-select__option"
          isDisabled={isDisabled}
          data={option}
          {...rest}
        >
          <OptionLabel>{option.label || <i>{t('no-name')}</i>}</OptionLabel>
          <OptionValue>({option.value})</OptionValue>
          <OptionExternalId>
            {option.externalId || <i>{t('no-external-id')}</i>}
          </OptionExternalId>
        </OptionWrapper>
      ) : null}
    </>
  );
};

const OptionWrapper = styled(components.Option)`
  display: grid;
  grid-template-areas: 'name id' 'externalId . ';
  padding: 0.5rem 1rem;
  &:hover {
    background-color: ${Colors['midblue-7'].hex()};
  }
  &:focus {
    background-color: ${Colors['greyscale-grey1'].hex()};
  }
`;
const OptionLabel = styled.span`
  grid-area: name;
  font-weight: bold;
  margin-right: 0.5rem;
`;
const OptionValue = styled.span`
  grid-area: id;
`;
const OptionExternalId = styled.span`
  grid-area: externalId;
  color: ${Colors['greyscale-grey5'].hex()};
`;
