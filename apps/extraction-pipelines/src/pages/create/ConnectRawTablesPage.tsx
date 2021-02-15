import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
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
  METADATA_PAGE_PATH,
} from '../../routing/CreateRouteConfig';

const StyledInput = styled.input`
  width: 50%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
  &:focus {
    outline: -webkit-focus-ring-color auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
`;

interface ConnectRawTablesPageProps {}

interface ConnectRawTablesFormInput {
  dbName: string;
  tableName: string;
}
export const INTEGRATION_CONNECT_RAW_TABLES_HEADING: Readonly<string> =
  'Integration Connect Raw Tables';
export const TABLE_NAME_LABEL: Readonly<string> = 'Table name';
export const DB_NAME_LABEL: Readonly<string> = 'Database name';
export const DB_NAME_REQUIRED: Readonly<string> = 'Database name is required';
export const TABLE_NAME_REQUIRED: Readonly<string> = 'Table name is required';
export const CONNECT_RAW_TABLES_HINT: Readonly<string> =
  'Enter the name of the database and tables that your integration writes data to';

const contactsSchema = yup.object().shape({
  dbName: yup.string().required(DB_NAME_REQUIRED),
  tableName: yup.string().required(TABLE_NAME_REQUIRED),
});
const ConnectRawTablesPage: FunctionComponent<ConnectRawTablesPageProps> = () => {
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<ConnectRawTablesFormInput>(
    {
      resolver: yupResolver(contactsSchema),
      defaultValues: {},
      reValidateMode: 'onSubmit',
    }
  );
  const handleNext = () => {
    history.push(createLink(METADATA_PAGE_PATH));
  };

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(DATA_SET_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_CONNECT_RAW_TABLES_HEADING}</GridH2Wrapper>
        <i className="description">{CONNECT_RAW_TABLES_HINT}</i>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <label htmlFor="integration-database-name" className="input-label">
            {DB_NAME_LABEL}
          </label>
          <span id="raw-table-db-name-hint" className="input-hint" />
          <ErrorMessage
            errors={errors}
            name="dbName"
            render={({ message }) => (
              <span id="raw-table-db-name-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="integration-database-name"
            name="dbName"
            type="text"
            ref={register}
            className={`cogs-input ${errors.dbName ? 'has-error' : ''}`}
            aria-invalid={!!errors.dbName}
            aria-describedby="raw-table-db-name-hint raw-table-db-name-error"
          />

          <label htmlFor="integration-table-name" className="input-label">
            {TABLE_NAME_LABEL}
          </label>
          <span id="table-name-hint" className="input-hint" />
          <ErrorMessage
            errors={errors}
            name="tableName"
            render={({ message }) => (
              <span id="table-name-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="integration-table-name"
            name="tableName"
            type="text"
            ref={register}
            className={`cogs-input ${errors.tableName ? 'has-error' : ''}`}
            aria-invalid={!!errors.tableName}
            aria-describedby="table-name-hint table-name-error"
          />

          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default ConnectRawTablesPage;
