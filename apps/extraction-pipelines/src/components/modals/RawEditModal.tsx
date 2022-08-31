import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { ModalContent } from 'components/modals/ModalContent';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import * as yup from 'yup';
import { StyledTitle3 } from 'components/styled';
import { DetailFieldNames, ExtpipeRawTable } from 'model/Extpipe';
import { selectedRawTablesRule } from 'utils/validation/extpipeSchemas';
import { useForm } from 'react-hook-form';
import { mapStoredToDefault } from 'utils/raw/rawUtils';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { yupResolver } from '@hookform/resolvers/yup';
import { EditModal } from 'components/modals/EditModal';
import { Button, Select } from '@cognite/cogs.js';
import {
  DatabaseWithTablesItem,
  useRawDBAndTables,
} from 'hooks/useRawDBAndTables';
import styled from 'styled-components';
import { MissingCapabilityBox } from 'components/accessCheck/CapabilityCheck';
import { getProject } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

interface RawEditModalProps {
  visible: boolean;
  close: () => void;
}

const pageSchema = yup.object().shape({ ...selectedRawTablesRule });
interface ModalFormInput {
  selectedRawTables: ExtpipeRawTable[];
}

export const RawEditModal: FunctionComponent<RawEditModalProps> = ({
  visible,
  close,
}: PropsWithChildren<RawEditModalProps>) => {
  const { t } = useTranslation();
  const project = getProject();
  const { data: databases, isError } = useRawDBAndTables();
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: storedExtpipe } = useExtpipeById(selected?.id);
  const { mutate } = useDetailsUpdate();
  const methods = useForm<ModalFormInput>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      selectedRawTables: mapStoredToDefault(storedExtpipe?.rawTables)
        .selectedRawTables,
    },
  });

  const { register, setValue, setError, clearErrors } = methods;
  useEffect(() => {
    register('selectedRawTables');
  }, [register]);

  useEffect(() => {
    setValue('selectedRawTables', storedExtpipe?.rawTables ?? []);
  }, [setValue, storedExtpipe]);

  const saveChanges = async (values: ExtpipeRawTable[], errMsg: string) => {
    clearErrors('selectedRawTables');
    if (storedExtpipe && project) {
      const t = createUpdateSpec({
        project,
        id: storedExtpipe.id,
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
            message: errMsg,
          });
        },
      });
    } else {
      setError('selectedRawTables', {
        type: 'server',
        message: errMsg,
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
          {t('edit-raw-title')}
        </StyledTitle3>
        <p>{t('edit-raw-desc')}</p>
        <div css="height: 1rem" />
        {isError &&
          MissingCapabilityBox({
            text: t('edit-raw-missing-capability'),
            requiredPermissions: [
              { acl: 'raw', action: 'READ' },
              { acl: 'raw', action: 'LIST' },
            ],
          })}

        {databases != null && (
          <RawEditModalView
            close={close}
            databases={databases}
            onSave={(tables) =>
              saveChanges(tables, t('could-not-store-raw-table'))
            }
            initial={storedExtpipe?.rawTables || []}
          />
        )}
      </ModalContent>
    </EditModal>
  );
};

type ViewProps = {
  initial: ExtpipeRawTable[];
  close: () => void;
  onSave: (tables: ExtpipeRawTable[]) => void;
  databases: DatabaseWithTablesItem[];
};
export const RawEditModalView = ({
  initial,
  close,
  onSave,
  databases,
}: ViewProps) => {
  const { t } = useTranslation();
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
            {tables.map((table: ExtpipeRawTable, index) => (
              <div css="display: flex; gap: 0.5rem">
                <div css="flex: 1">
                  <Select
                    closeMenuOnSelect
                    onChange={(selection: {
                      label: string;
                      value: ExtpipeRawTable;
                    }) => {
                      if (selection == null) return;
                      setTables(
                        tables.map((current, idx) =>
                          idx === index ? selection.value : current
                        )
                      );
                    }}
                    placeholderSelectText={t('select-raw-table')}
                    options={dropdownOptions}
                    value={
                      table.dbName === ''
                        ? { value: null, label: t('select-raw-table') }
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
            <Button
              icon="AddLarge"
              onClick={addRow}
              data-testid="add-new-table=btn"
            >
              {t('add-new-table')}
            </Button>
          </div>
        </Col>
      </ModalContent>
      <div key="modal-footer" className="cogs-modal-footer-buttons">
        <Button type="ghost" onClick={close}>
          {t('cancel')}
        </Button>
        <Button
          type="primary"
          onClick={onConfirmClicked}
          data-testid="raw-edit-confirm-btn"
        >
          {t('confirm')}
        </Button>
      </div>
    </Col>
  );
};

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
