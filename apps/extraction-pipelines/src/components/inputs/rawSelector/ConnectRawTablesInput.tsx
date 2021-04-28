import React, { FunctionComponent, PropsWithoutRef, useState } from 'react';
import { Loader } from '@cognite/cogs.js';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import RawSelector from 'components/inputs/rawSelector/RawSelector';
import { useRawDBAndTables } from 'hooks/useRawDBAndTables';
import { IntegrationRawTable } from 'model/Integration';
import { ErrorSpan, Hint } from 'styles/StyledForm';

interface ConnectRawTablesPageProps {
  onSelect?: (rawTables: IntegrationRawTable[]) => void;
}

export const INTEGRATION_CONNECT_RAW_TABLES_HEADING: Readonly<string> =
  'Integration Connect Raw Tables';

export const CONNECT_RAW_TABLES_HINT: Readonly<string> =
  'Select the name of the database and tables that your integration writes data to';

const ConnectRawTablesInput: FunctionComponent<ConnectRawTablesPageProps> = ({
  onSelect,
}: PropsWithoutRef<ConnectRawTablesPageProps>) => {
  const [selectedDb, setSelectedDb] = useState<string>('');
  const { setValue, errors, watch, clearErrors } = useFormContext();
  const { data, isLoading } = useRawDBAndTables();
  const selectedTables = watch('selectedRawTables');
  if (isLoading) {
    return <Loader />;
  }

  const setChangesSaved = () => {
    clearErrors('selectedRawTables');
  };

  const setSelectedTables = (values: IntegrationRawTable[]) => {
    if (onSelect) {
      onSelect(values);
    }
    setValue('selectedRawTables', values);
  };

  return (
    <>
      <Hint>{CONNECT_RAW_TABLES_HINT}</Hint>
      <ErrorMessage
        errors={errors}
        name="selectedRawTables"
        render={({ message }) => (
          <ErrorSpan id="raw-table-db-name-error" className="error-message">
            {message}
          </ErrorSpan>
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
