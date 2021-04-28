import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { AutoComplete, Colors, Loader } from '@cognite/cogs.js';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { MutationStatus } from 'react-query';
import { DataSet, ListResponse } from '@cognite/sdk';
import { DataSetSelectOption } from 'components/inputs/dataset/DataSetSelectOption';
import { InputController } from 'components/inputs/InputController';
import { Hint, StyledLabel } from 'styles/StyledForm';

const StyledAutoComplete = styled(AutoComplete)`
  width: 50%;
  align-self: flex-start;
  margin-bottom: 1rem;
  .cogs-select__control--is-focused {
    outline: ${Colors.primary.hex()} auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
  .cogs-select__single-value {
    color: ${Colors.black.hex()};
  }
  .cogs-select__clear-indicator::after {
    display: none;
  }
`;

export const DATA_SET_ID_LABEL: Readonly<string> = 'Data set';
export const DATA_SET_ID_TIP: Readonly<string> =
  'Type in the name or id of your data set';
export const DATA_SET_ID_REQUIRED: Readonly<string> = 'Data set is required';

interface DataSetIdPageProps {
  data?: ListResponse<DataSet[]>;
  renderLabel?: (labelText: string, inputId: string) => React.ReactNode;
  status: 'error' | 'success' | 'loading' | 'idle';
}

export const DATASET_LIST_LIMIT: Readonly<number> = 500;
type SelectOption = { value: number; label?: string };
const DataSetIdInput: FunctionComponent<DataSetIdPageProps> = ({
  data,
  status,
  renderLabel = (labelText, inputId) => (
    <StyledLabel id="data-set-id-label" htmlFor={inputId}>
      {labelText}
    </StyledLabel>
  ),
}: PropsWithoutRef<DataSetIdPageProps>) => {
  const { setValue, errors, watch, control } = useFormContext();
  const storedValue = parseInt(watch('dataSetId'), 10);

  const getOptions = (): SelectOption[] => {
    return data
      ? data.items.map(({ id, name, externalId }) => {
          return { value: id, label: name, externalId };
        })
      : [];
  };
  const options = getOptions();
  const selectedValue = options.filter(({ value }) => {
    return value === storedValue;
  })[0];

  if (status === 'loading') {
    return <Loader />;
  }

  const handleSelectChange = (option: SelectOption) => {
    setValue('dataSetId', option?.value ?? '');
  };

  const renderInput = (
    innerStatus: MutationStatus,
    innerOptions: SelectOption[],
    innerValue: null | SelectOption
  ) => {
    if (innerStatus === 'error') {
      return (
        <InputController
          name="dataSetId"
          inputId="data-set-id-input"
          control={control}
          defaultValue=""
          aria-invalid={!!errors.dataSetId}
          aria-describedby="data-set-id-hint data-set-id-error"
        />
      );
    }

    return (
      <StyledAutoComplete
        name="dataSetId"
        defaultValue={innerValue}
        aria-labelledby="data-set-id-label"
        components={{ Option: DataSetSelectOption }}
        options={innerOptions}
        isClearable
        noOptionsMessage={({ inputValue }: { inputValue: string }) =>
          `Data set with name/id: "${inputValue}" does not exist`
        }
        onChange={handleSelectChange}
        data-testid="dataset-select"
      />
    );
  };

  return (
    <>
      {renderLabel(DATA_SET_ID_LABEL, 'data-set-id-input')}
      <Hint id="data-set-id-hint" className="input-hint">
        {DATA_SET_ID_TIP}
      </Hint>
      <ErrorMessage
        errors={errors}
        name="dataSetId"
        render={({ message }) => (
          <span id="data-set-id-error" className="error-message">
            {message}
          </span>
        )}
      />
      {renderInput(status, options, selectedValue)}
    </>
  );
};
export default DataSetIdInput;
