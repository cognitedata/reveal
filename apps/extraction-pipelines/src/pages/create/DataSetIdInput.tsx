import React, { FunctionComponent } from 'react';
import { AutoComplete, Colors, Loader } from '@cognite/cogs.js';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { MutationStatus } from 'react-query';
import { useDataSetsList } from '../../hooks/useDataSetsList';
import { DataSetSelectOption } from '../../components/inputs/dataset/DataSetSelectOption';

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
const StyledInput = styled.input`
  width: 50%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;
export const DATA_SET_ID_LABEL: Readonly<string> = 'Data set';
export const DATA_SET_ID_TIP: Readonly<string> =
  'Type in the name or id of your data set';
export const DATA_SET_ID_REQUIRED: Readonly<string> = 'Data set is required';

interface DataSetIdPageProps {}

export const DATASET_LIST_LIMIT: Readonly<number> = 500;
type SelectOption = { value: number; label?: string };
const DataSetIdInput: FunctionComponent<DataSetIdPageProps> = () => {
  const { data, status } = useDataSetsList(DATASET_LIST_LIMIT);
  const { register, setValue, errors } = useFormContext();
  register('datasetId');
  if (status === 'loading') {
    return <Loader />;
  }

  const getOptions = (): SelectOption[] => {
    return data
      ? data.items.map(({ id, name, externalId }) => {
          return { value: id, label: name, externalId };
        })
      : [];
  };

  const handleSelectChange = (option: SelectOption) => {
    setValue('datasetId', option?.value ?? '');
  };

  const renderInput = (innerStatus: MutationStatus) => {
    if (innerStatus === 'error') {
      return (
        <StyledInput
          id="data-set-id-input"
          name="datasetId"
          type="text"
          ref={register}
          className={`cogs-input ${errors.dataSetId ? 'has-error' : ''}`}
          aria-invalid={!!errors.dataSetId}
          aria-describedby="data-set-id-hint data-set-id-error"
        />
      );
    }

    return (
      <StyledAutoComplete
        name="datasetId"
        aria-labelledby="data-set-id-label"
        components={{ Option: DataSetSelectOption }}
        options={getOptions()}
        isClearable
        onChange={handleSelectChange}
        data-testid="dataset-select"
      />
    );
  };

  return (
    <>
      <label
        id="data-set-id-label"
        htmlFor="data-set-id-input"
        className="input-label"
      >
        {DATA_SET_ID_LABEL}
      </label>
      <span id="data-set-id-hint" className="input-hint">
        {DATA_SET_ID_TIP}
      </span>
      <ErrorMessage
        errors={errors}
        name="datasetId"
        render={({ message }) => (
          <span id="data-set-id-error" className="error-message">
            {message}
          </span>
        )}
      />
      {renderInput(status)}
    </>
  );
};
export default DataSetIdInput;
