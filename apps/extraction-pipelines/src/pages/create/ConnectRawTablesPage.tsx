import React, { FunctionComponent, useState } from 'react';
import { Button, Loader } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
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
import RawSelector, {
  SelectedTable,
} from '../../components/inputs/rawSelector/RawSelector';
import { useRawDBAndTables } from '../../hooks/useRawDBAndTables';

interface ConnectRawTablesPageProps {}

export const INTEGRATION_CONNECT_RAW_TABLES_HEADING: Readonly<string> =
  'Integration Connect Raw Tables';
export const TABLE_REQUIRED: Readonly<string> = 'Select a database table';
export const CONNECT_RAW_TABLES_HINT: Readonly<string> =
  'Select the name of the database and tables that your integration writes data to';

export const stringCompare = (a = '', b = '') => {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  return al.localeCompare(bl, 'nb');
};
const ConnectRawTablesPage: FunctionComponent<ConnectRawTablesPageProps> = () => {
  const history = useHistory();
  const [selectedDb, setSelectedDb] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);

  const { data, isLoading } = useRawDBAndTables();
  if (isLoading) {
    return <Loader />;
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTables.length === 0) {
      setError(TABLE_REQUIRED);
    } else {
      history.push(createLink(METADATA_PAGE_PATH));
    }
  };

  function setChangesSaved() {
    setError(null);
  }

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(DATA_SET_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_CONNECT_RAW_TABLES_HEADING}</GridH2Wrapper>
        <i className="description">{CONNECT_RAW_TABLES_HINT}</i>
        <CreateFormWrapper onSubmit={handleNext}>
          {error && (
            <span id="raw-table-db-name-error" className="error-message">
              {error}
            </span>
          )}

          <RawSelector
            databaseList={data ?? []}
            setChangesSaved={setChangesSaved}
            selectedDb={selectedDb}
            selectedTables={selectedTables}
            setSelectedDb={setSelectedDb}
            setSelectedTables={setSelectedTables}
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
