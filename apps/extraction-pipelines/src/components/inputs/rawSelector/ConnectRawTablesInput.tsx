import React, { FunctionComponent, useState } from 'react';
import { Loader } from '@cognite/cogs.js';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import RawSelector from 'components/inputs/rawSelector/RawSelector';
import { useRawDBAndTables } from 'hooks/useRawDBAndTables';
import { IntegrationRawTable } from 'model/Integration';

interface ConnectRawTablesPageProps {}

export const INTEGRATION_CONNECT_RAW_TABLES_HEADING: Readonly<string> =
  'Integration Connect Raw Tables';
export const TABLE_REQUIRED: Readonly<string> = 'Select a database table';
export const CONNECT_RAW_TABLES_HINT: Readonly<string> =
  'Select the name of the database and tables that your integration writes data to';

const ConnectRawTablesInput: FunctionComponent<ConnectRawTablesPageProps> = () => {
  const [selectedDb, setSelectedDb] = useState<string>('');
  const { setValue, errors, watch, clearErrors } = useFormContext();
  const { data, isLoading } = useRawDBAndTables();

  if (isLoading) {
    return <Loader />;
  }

  function setChangesSaved() {
    clearErrors('selectedRawTables');
  }

  const setSelectedTables = (values: IntegrationRawTable[]) => {
    setValue('selectedRawTables', values);
  };

  const selectedTables = watch('selectedRawTables');

  return (
    <>
      <i className="description">{CONNECT_RAW_TABLES_HINT}</i>
      <ErrorMessage
        errors={errors}
        name="selectedRawTables"
        render={({ message }) => (
          <span id="raw-table-db-name-error" className="error-message">
            {message}
          </span>
        )}
      />
      <RawSelector
        databaseList={data ?? []}
        setChangesSaved={setChangesSaved}
        selectedDb={selectedDb}
        selectedTables={selectedTables}
        setSelectedDb={setSelectedDb}
        setSelectedTables={setSelectedTables}
      />
    </>
  );
};
export default ConnectRawTablesInput;
