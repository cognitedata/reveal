import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { ModalContent } from 'components/modals/ModalContent';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import * as yup from 'yup';
import { StyledTitle3 } from 'styles/StyledHeadings';
import { DetailFieldNames, IntegrationRawTable } from 'model/Integration';
import { selectedRawTablesRule } from 'utils/validation/integrationSchemas';
import { useForm } from 'react-hook-form';
import { mapStoredToDefault } from 'utils/raw/rawUtils';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { yupResolver } from '@hookform/resolvers/yup';
import { EditModal } from 'components/modals/EditModal';
import { Button, Select } from '@cognite/cogs.js';
import {
  DatabaseWithTablesItem,
  useRawDBAndTables,
} from 'hooks/useRawDBAndTables';
import styled from 'styled-components';

interface RawEditModalProps {
  visible: boolean;
  close: () => void;
}
const pageSchema = yup.object().shape({ ...selectedRawTablesRule });

interface ModalFormInput {
  selectedRawTables: IntegrationRawTable[];
}

export const RawEditModal: FunctionComponent<RawEditModalProps> = ({
  visible,
  close,
}: PropsWithChildren<RawEditModalProps>) => {
  const { project } = useAppEnv();
  const { data: databases } = useRawDBAndTables();
  const { integration: selected } = useSelectedIntegration();
  const { data: storedIntegration } = useIntegrationById(selected?.id);
  const { mutate } = useDetailsUpdate();
  const methods = useForm<ModalFormInput>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      selectedRawTables: mapStoredToDefault(storedIntegration?.rawTables)
        .selectedRawTables,
    },
  });

  const { register, setValue, setError, clearErrors } = methods;
  useEffect(() => {
    register('selectedRawTables');
  }, [register]);

  useEffect(() => {
    setValue('selectedRawTables', storedIntegration?.rawTables ?? []);
  }, [setValue, storedIntegration]);

  const saveChanges = async (values: IntegrationRawTable[]) => {
    clearErrors('selectedRawTables');
    if (storedIntegration && project) {
      const t = createUpdateSpec({
        project,
        id: storedIntegration.id,
        fieldValue: values,
        fieldName: 'rawTables',
      });
      await mutate(t, {
        onSuccess: () => {
          close();
        },
        onError: () => {
          setError('selectedRawTables', {
            type: 'server',
            message: `Could not store raw table`,
          });
        },
      });
    } else {
      setError('selectedRawTables', {
        type: 'server',
        message: `Could not store raw table`,
      });
    }
  };

  return (
    <EditModal
      visible={visible}
      width={872}
      close={close}
      title={DetailFieldNames.RAW_TABLE}
    >
      <ModalContent>
        <StyledTitle3 data-testid="raw-table-edit-modal">
          Document RAW tables associated with the extraction pipeline
        </StyledTitle3>
        <p>
          Select the CDF RAW tables used in the extraction pipeline ingestion.
          Note: This is for documentation only and does not affect operations.
          The selected tables appear in the data set lineage.
        </p>
        {databases != null && (
          <RawEditModalView
            close={close}
            databases={databases}
            onSave={(tables) => saveChanges(tables)}
            initial={storedIntegration?.rawTables || []}
          />
        )}
      </ModalContent>
    </EditModal>
  );
};

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

type ViewProps = {
  initial: IntegrationRawTable[];
  close: () => void;
  onSave: (tables: IntegrationRawTable[]) => void;
  databases: DatabaseWithTablesItem[];
};
export const RawEditModalView = ({
  initial,
  close,
  onSave,
  databases,
}: ViewProps) => {
  const [tables, setTables] = useState(
    initial.length >= 1 ? initial : [{ dbName: '', tableName: '' }]
  );

  const dropdownOptions = databases.map((database) => {
    const tableOptions = database.tables.map((table) => ({
      value: { dbName: database.database.name, tableName: table.name },
      label: `${database.database.name} • ${table.name}`,
    }));
    return { label: database.database.name, options: tableOptions };
  });

  const addRow = () => {
    setTables([...tables, { dbName: '', tableName: '' }]);
  };

  const deleteRow = (index: number) => {
    setTables(tables.filter((_, i) => i !== index));
  };

  const onConfirmClicked = () => {
    const filteredTables = tables.filter((t) => t.dbName.trim().length >= 1);
    onSave(filteredTables);
  };

  return (
    <Col>
      <ModalContent>
        <Col>
          <Col>
            {tables.map((table: IntegrationRawTable, index) => (
              <div css="display: flex; gap: 0.5rem">
                <div css="flex: 1">
                  <Select
                    closeMenuOnSelect
                    onChange={(selection: {
                      label: string;
                      value: IntegrationRawTable;
                    }) => {
                      if (selection == null) return;
                      setTables(
                        tables.map((current, idx) =>
                          idx === index ? selection.value : current
                        )
                      );
                    }}
                    placeholderSelectText="Select RAW table"
                    options={dropdownOptions}
                    value={
                      table.dbName === ''
                        ? { value: null, label: 'Select RAW table' }
                        : {
                            value: table,
                            label: `${table.dbName} • ${table.tableName}`,
                          }
                    }
                  />
                </div>
                <div css="flex: 0">
                  <Button
                    type="ghost"
                    icon="Close"
                    aria-label="Remove row"
                    onClick={() => deleteRow(index)}
                  />
                </div>
              </div>
            ))}
          </Col>
          <div>
            <Button icon="PlusCompact" onClick={addRow}>
              Add new table
            </Button>
          </div>
        </Col>
      </ModalContent>
      <div key="modal-footer" className="cogs-modal-footer-buttons">
        <Button type="ghost" onClick={close}>
          Cancel
        </Button>
        <Button type="primary" onClick={onConfirmClicked}>
          Confirm
        </Button>
      </div>
    </Col>
  );
};
