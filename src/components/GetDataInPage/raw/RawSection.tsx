import React, {
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
import message from 'antd/lib/message';
import { useRawList } from 'actions';
import { useQueryClient } from 'react-query';
import Spin from 'antd/lib/spin';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { listRawDatabasesKey, listRawTablesKey } from '../../../actions/keys';

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
  const [createModal, setCreateModal] = useState<string>('');
  const [createVisible, setCreateVisible] = useState<boolean>(false);
  const [nameField, setNameField] = useState<string>('');

  const { flow } = getFlow();
  const { data: hasRawList } = usePermissions(flow, 'rawAcl', 'LIST');
  const { data: hasRawRead } = usePermissions(flow, 'rawAcl', 'READ');

  const hasRawPermissions = hasRawList && hasRawRead;

  const { tables, isLoading } = useRawList();

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
          message.success(`Database ${res[0].name} has been created!`);
          setSelectedDb(nameField);
          invalidateList();
        })
        .catch((err) => {
          message.error(
            err.message ||
              'Database could not be created, a database with the same name already exists.'
          );
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
          message.success(`Table ${res[0].name} has been created!`);
          invalidateList();
        })
        .catch((err) => {
          message.error(
            err.message ||
              'Database could not be created, a database with the same name already exists.'
          );
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
          <Col span={6}> Unique name </Col>
          <Col span={16}>
            <Input
              autoFocus
              value={nameField}
              onChange={(e) => setNameField(e.currentTarget.value)}
              placeholder="Please enter database name"
            />
          </Col>
        </Row>
      </Modal>
      <FieldLabel>
        If your data already exists in the RAW staging area, document the tables
        that you use in your new data set
      </FieldLabel>
      {!hasRawPermissions ? (
        <BlockedInformationWrapper style={{ marginTop: '20px' }}>
          <p>
            You have insufficient rights to view RAW tables in this project.
            <br /> Please request the following from your project administrator:
            <br />
            <Tag>raw:read</Tag>
            <Tag>raw:list</Tag>
          </p>
        </BlockedInformationWrapper>
      ) : (
        <RawSelector
          databaseList={tables ?? []}
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
        Learn more on how to ingest data to your RAW tables{' '}
        <a
          href="https://docs.cognite.com/cdf/integration/"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        .{' '}
      </MiniInfoTitle>
    </>
  );
};
