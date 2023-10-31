import {
  Dispatch,
  FunctionComponent,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { Modal, Input, Icon, Chip, Flex, toast } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { useRawList } from '../../../actions';
import { listRawDatabasesKey, listRawTablesKey } from '../../../actions/keys';
import { useTranslation } from '../../../common/i18n';
import {
  BlockedInformationWrapper,
  Col,
  FieldLabel,
  MiniInfoTitle,
  RawTable,
  Row,
} from '../../../utils';
import RawSelector from '../../RawSelector';

interface RawSectionProps {
  selectedDb: string;
  setSelectedDb: Dispatch<SetStateAction<string>>;
  selectedTables: RawTable[];
  setSelectedTables: Dispatch<SetStateAction<RawTable[]>>;
  setChangesSaved(value: boolean): void;
}
export const RawSection: FunctionComponent<RawSectionProps> = ({
  selectedDb,
  setSelectedDb,
  selectedTables,
  setSelectedTables,
  setChangesSaved,
}: PropsWithChildren<RawSectionProps>) => {
  const { t } = useTranslation();
  const [createModal, setCreateModal] = useState<string>('');
  const [createVisible, setCreateVisible] = useState<boolean>(false);
  const [nameField, setNameField] = useState<string>('');

  const { data: hasRawList } = usePermissions('rawAcl', 'LIST');
  const { data: hasRawRead } = usePermissions('rawAcl', 'READ');

  const hasRawPermissions = hasRawList && hasRawRead;

  const { databases, tables, isLoading } = useRawList();

  const client = useQueryClient();

  const invalidateList = () => {
    client.invalidateQueries(listRawDatabasesKey);
    client.invalidateQueries(listRawTablesKey);
  };

  const createItem = () => {
    if (createModal === 'database') {
      sdk.raw
        .createDatabases([{ name: nameField }])
        .then((res: any) => {
          setNameField('');
          setCreateModal('');
          setCreateVisible(false);
          toast.success(
            t('raw-section-database-created', { name: res[0].name })
          );
          setSelectedDb(nameField);
          invalidateList();
        })
        .catch((err) => {
          toast.error(err.message || t('raw-section-database-created-error'));
        });
    } else {
      sdk.raw
        .createTables(selectedDb, [{ name: nameField }])
        .then((res: any) => {
          setNameField('');
          setCreateModal('');
          setCreateVisible(false);
          setSelectedTables([
            ...selectedTables,
            { databaseName: selectedDb, tableName: nameField },
          ]);
          toast.success(t('raw-section-table-created', { name: res[0].name }));
          invalidateList();
        })
        .catch((err) => {
          toast.error(err.message || t('raw-section-table-created-error'));
        });
    }
  };

  if (isLoading) {
    return <Icon size={24} type="Loader" />;
  }

  return (
    <>
      <Modal
        title={`Create ${createModal}`}
        visible={createVisible}
        onOk={() => createItem()}
        onCancel={() => setCreateVisible(false)}
        getContainer={document.getElementById('getDataInPageContainer')!}
      >
        <Row>
          <Col span={6}>{t('unique-name')}</Col>
          <Col span={16}>
            <Input
              autoFocus
              fullWidth
              value={nameField}
              onChange={(e) => setNameField(e.currentTarget.value)}
              placeholder={t('raw-section-enter-database-name')}
            />
          </Col>
        </Row>
      </Modal>
      <FieldLabel>{t('raw-section-document-tables')}</FieldLabel>
      {!hasRawPermissions ? (
        <BlockedInformationWrapper style={{ marginTop: '20px' }}>
          <p>
            {t('raw-section-insufficient-rights-p1')}
            <br /> {t('raw-section-insufficient-rights-p2')}
            <br />
            <Flex gap={8}>
              <Chip label="raw:read" hideTooltip size="x-small" />
              <Chip label="raw:list" hideTooltip size="x-small" />
            </Flex>
          </p>
        </BlockedInformationWrapper>
      ) : (
        <RawSelector
          databaseList={databases ?? []}
          tableList={tables ?? []}
          setCreateModal={setCreateModal}
          setCreateVisible={setCreateVisible}
          setSelectedDb={setSelectedDb}
          selectedTables={selectedTables}
          setSelectedTables={setSelectedTables}
          setChangesSaved={setChangesSaved}
          selectedDb={selectedDb}
        />
      )}
      <MiniInfoTitle>
        {t('raw-section-learn-more')}
        <a
          href="https://docs.cognite.com/cdf/integration/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('here')}
        </a>
      </MiniInfoTitle>
    </>
  );
};
