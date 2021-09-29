import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { AutoComplete, Colors, Loader } from '@cognite/cogs.js';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { MutationStatus } from 'react-query';
import { DataSet, ListResponse } from '@cognite/sdk';
import { DataSetSelectOption } from 'components/inputs/dataset/DataSetSelectOption';
import { InputController } from 'components/inputs/InputController';
import { Hint } from 'styles/StyledForm';
import ValidationError from 'components/form/ValidationError';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { DATA_SET_ID_HINT } from 'utils/constants';

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

interface DataSetIdPageProps {
  data?: ListResponse<DataSet[]>;
  renderLabel?: (labelText: string, inputId: string) => React.ReactNode;
  status: 'error' | 'success' | 'loading' | 'idle';
  autoFocus?: boolean;
}

export const DATASET_LIST_LIMIT: Readonly<number> = 500;
export type SelectOption = { value: number; label?: string };
const DataSetIdInput: FunctionComponent<DataSetIdPageProps> = ({
  data,
  status,
  renderLabel,
  autoFocus = false,
}: PropsWithoutRef<DataSetIdPageProps>) => {
  const {
    setValue,
    formState: { errors },
    watch,
    control,
  } = useFormContext<any>();
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
        autoFocus={autoFocus}
      />
    );
  };

  return (
    <>
      {renderLabel && renderLabel(TableHeadings.DATA_SET, 'data-set-id-input')}
      <Hint id="data-set-id-hint" className="input-hint">
        {DATA_SET_ID_HINT}
      </Hint>
      <ValidationError errors={errors} name="dataSetId" />
      {renderInput(status, options, selectedValue)}
    </>
  );
};
export default DataSetIdInput;
