import React, { FunctionComponent } from 'react';
import { AutoComplete, Button, Colors, Loader } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { MutationStatus } from 'react-query';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import {
  DATA_SET_PAGE_PATH,
  RAW_TABLE_PAGE_PATH,
} from '../../routing/CreateRouteConfig';
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
export const INTEGRATION_DATA_SET_ID_HEADING: Readonly<string> =
  'Integration Data Set';
export const DATA_SET_ID_TIP: Readonly<string> =
  'Type in the name or id of your data set';
export const DATA_SET_ID_REQUIRED: Readonly<string> = 'Data set is required';
const dataSetIdSchema = yup.object().shape({
  dataSetId: yup.string().required(DATA_SET_ID_REQUIRED),
});

interface DataSetIdPageProps {}

interface DataSetIdFormInput {
  dataSetId: string;
}
export const DATASET_LIST_LIMIT: Readonly<number> = 500;
type SelectOption = { value: number; label?: string };
const DataSetIdPage: FunctionComponent<DataSetIdPageProps> = () => {
  const history = useHistory();
  const { data, status } = useDataSetsList(DATASET_LIST_LIMIT);
  const {
    register,
    handleSubmit,
    errors,
    setValue,
  } = useForm<DataSetIdFormInput>({
    resolver: yupResolver(dataSetIdSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  register('dataSetId');

  if (status === 'loading') {
    return <Loader />;
  }
  const handleNext = () => {
    history.push(createLink(RAW_TABLE_PAGE_PATH));
  };

  const getOptions = (): SelectOption[] => {
    return data
      ? data.items.map(({ id, name, externalId }) => {
          return { value: id, label: name, externalId };
        })
      : [];
  };

  const handleSelectChange = (option: SelectOption) => {
    if (option) {
      setValue('dataSetId', option.value);
    }
  };

  const renderInput = (innerStatus: MutationStatus) => {
    if (innerStatus === 'error') {
      return (
        <StyledInput
          id="data-set-id-input"
          name="dataSetId"
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
        name="dataSetId"
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
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(DATA_SET_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_DATA_SET_ID_HEADING}</GridH2Wrapper>
        <CreateFormWrapper
          onSubmit={handleSubmit(handleNext)}
          data-testid="data-set-form"
        >
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
            name="dataSetId"
            render={({ message }) => (
              <span id="data-set-id-error" className="error-message">
                {message}
              </span>
            )}
          />
          {renderInput(status)}
          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default DataSetIdPage;
