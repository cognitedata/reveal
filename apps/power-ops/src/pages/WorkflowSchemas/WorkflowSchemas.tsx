import { Button, Flex, Row, Table, Title } from '@cognite/cogs.js';
import { useMemo, useState } from 'react';
import { WorkflowSchemaEditor } from 'components/WorkflowSchemaEditor/WorkflowSchemaEditor';
import { Column } from 'react-table';
import { DeleteModal } from 'components/DeleteModal/DeleteModal';
import {
  convertEditableToWorkflowSchemaUpdate,
  convertWorkflowSchemaToEditable,
} from 'pages/WorkflowSchemas/utils';
import {
  WorkflowSchemaWithProcesses,
  WorkflowSchemaWithProcessesUpdate,
} from '@cognite/power-ops-api-types';

interface Props {
  workflowSchemas: WorkflowSchemaWithProcesses[];
  onCreate: () => void;
  onSave: (newWorkflowSchema: WorkflowSchemaWithProcessesUpdate) => void;
  onDelete: (workflowSchema: WorkflowSchemaWithProcesses) => void;
}

export const WorkflowSchemas = ({
  workflowSchemas,
  onCreate,
  onSave,
  onDelete,
}: Props) => {
  const [selectedWorkflowSchemaIndex, setSelectedWorkflowSchemaIndex] =
    useState(NaN);
  const selectedWorkflowSchema = Number.isNaN(selectedWorkflowSchemaIndex)
    ? undefined
    : workflowSchemas[selectedWorkflowSchemaIndex];
  const [workflowSchemaToDelete, setWorkflowSchemaToDelete] =
    useState<WorkflowSchemaWithProcesses>();

  const columns: Column[] = useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Type', accessor: 'workflowType' },
      {
        Header: 'Actions',
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ row: { index, original } }) => (
          <div style={{ textAlign: 'center' }}>
            <Button
              icon="Edit"
              onClick={() => setSelectedWorkflowSchemaIndex(index)}
              aria-label="Edit"
            />
            <Button
              icon="Delete"
              aria-label="Delete"
              onClick={() => {
                setWorkflowSchemaToDelete(
                  original as WorkflowSchemaWithProcesses
                );
                setSelectedWorkflowSchemaIndex(NaN);
              }}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <DeleteModal
        title="Workflow Schema"
        isOpen={Boolean(workflowSchemaToDelete)}
        onOk={() => {
          if (!workflowSchemaToDelete) return;
          onDelete(workflowSchemaToDelete);
          setWorkflowSchemaToDelete(undefined);
        }}
        onCancel={() => setWorkflowSchemaToDelete(undefined)}
      />
      <Flex style={{ padding: 20 }}>
        <div style={{ flexGrow: 1 }}>
          <Title level={1}>Workflow Schemas</Title>
        </div>
        <div>
          <Button
            icon="AddLarge"
            aria-label="New"
            onClick={() => {
              setSelectedWorkflowSchemaIndex(NaN);
              onCreate();
            }}
          >
            New
          </Button>
        </div>
      </Flex>
      <Row cols={2} gutter={20}>
        <div>
          <Table
            columns={columns}
            dataSource={workflowSchemas}
            pagination={false}
          />
        </div>
        <div>
          {selectedWorkflowSchema && (
            <WorkflowSchemaEditor
              value={convertWorkflowSchemaToEditable(selectedWorkflowSchema)}
              onSave={(ws) =>
                onSave(
                  convertEditableToWorkflowSchemaUpdate(
                    ws,
                    selectedWorkflowSchema
                  )
                )
              }
              // 88px is the title, 56px is the top bar
              height="calc(100vh - 88px - 56px)"
            />
          )}
        </div>
      </Row>
    </>
  );
};
