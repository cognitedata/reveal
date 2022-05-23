import {
  Dispatch,
  FunctionComponent,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';
import Tag from 'antd/lib/tag';
import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import {
  FieldLabel,
  BlockedInformationWrapper,
  MiniInfoTitle,
} from 'utils/styledComponents';
import RawSelector from 'components/RawSelector';
import { RawTable } from 'utils/types';
import { getContainer } from 'utils/shared';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import { notification } from 'antd';
import { useRawList } from 'actions';
import { useQueryClient } from 'react-query';
import Spin from 'antd/lib/spin';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { listRawDatabasesKey, listRawTablesKey } from '../../../actions/keys';
import { useTranslation } from 'common/i18n';

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

  const { flow } = getFlow();
  const { data: hasRawList } = usePermissions(flow, 'rawAcl', 'LIST');
  const { data: hasRawRead } = usePermissions(flow, 'rawAcl', 'READ');

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
          notification.success({
            message: t('raw-section-database-created', { name: res[0].name }),
          });
          setSelectedDb(nameField);
          invalidateList();
        })
        .catch((err) => {
          notification.error({
            message: err.message || t('raw-section-database-created-error'),
          });
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
          notification.success({
            message: t('raw-section-table-created', { name: res[0].name }),
          });
          invalidateList();
        })
        .catch((err) => {
          notification.error({
            message: err.message || t('raw-section-table-created-error'),
          });
        });
    }
  };

  if (isLoading) {
    return <Spin />;
  }

  return (
    <>
      <Modal
        title={`Create ${createModal}`}
        visible={createVisible}
        onOk={() => createItem()}
        onCancel={() => setCreateVisible(false)}
        getContainer={getContainer}
      >
        <Row>
          <Col span={6}>{t('unique-name')}</Col>
          <Col span={16}>
            <Input
              autoFocus
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
            <Tag>raw:read</Tag>
            <Tag>raw:list</Tag>
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
