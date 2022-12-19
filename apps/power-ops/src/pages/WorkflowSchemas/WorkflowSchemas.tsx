import { Button, Flex } from '@cognite/cogs.js';
import { useCallback, useMemo, useState } from 'react';
import { WorkflowSchemaEditor } from 'components/WorkflowSchemaEditor/WorkflowSchemaEditor';
import { DeleteModal } from 'components/DeleteModal/DeleteModal';
import {
  convertEditableToWorkflowSchemaUpdate,
  convertWorkflowSchemaToEditable,
} from 'pages/WorkflowSchemas/utils';
import {
  WorkflowSchemaWithProcesses,
  WorkflowSchemaWithProcessesCreate,
  WorkflowSchemaWithProcessesUpdate,
} from '@cognite/power-ops-api-types';
import { CommonHeader } from 'components/CommonHeader/CommonHeader';
import { CommonError } from 'components/CommonError/CommonError';
import { WorkflowSchemaTable } from 'components/WorkflowSchemaTable/WorkflowSchemaTable';
import { UnsavedChangesModal } from 'components/UnsavedChangesModal/UnsavedChangesModal';
import { flushSync } from 'react-dom';
import { WorkflowSchemaEditable } from 'types';

import { StyledRow } from './elements';

interface Props {
  workflowSchemas: WorkflowSchemaWithProcesses[];
  onCreate: (
    workflowSchema?: WorkflowSchemaWithProcessesCreate
  ) => Promise<any>;
  onDuplicate: (workflowSchema: WorkflowSchemaWithProcesses) => Promise<any>;
  onSave: (newWorkflowSchema: WorkflowSchemaWithProcessesUpdate) => void;
  onDelete: (workflowSchema: WorkflowSchemaWithProcesses) => void;
}

export const WorkflowSchemas = ({
  workflowSchemas,
  onCreate,
  onDuplicate,
  onSave,
  onDelete,
}: Props) => {
  const [selectedWorkflowSchemaIndex, setSelectedWorkflowSchemaIndex] =
    useState<number>();
  const selectedWorkflowSchema = useMemo(
    () =>
      selectedWorkflowSchemaIndex === undefined
        ? undefined
        : workflowSchemas[selectedWorkflowSchemaIndex],
    [workflowSchemas, selectedWorkflowSchemaIndex]
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedWorkflowSchemaIndex, setUnsavedWorkflowSchemaIndex] = useState<
    number | undefined | false
  >(false);

  const [workflowSchemaToDelete, setWorkflowSchemaToDelete] =
    useState<WorkflowSchemaWithProcesses>();

  const handleCreate = async () => {
    setSelectedWorkflowSchemaIndex(undefined);
    await onCreate();
    flushSync(() => setSelectedWorkflowSchemaIndex(0));
  };

  const handleDuplicate = async (wf: WorkflowSchemaWithProcesses) => {
    setSelectedWorkflowSchemaIndex(undefined);
    await onDuplicate(wf);
    flushSync(() => setSelectedWorkflowSchemaIndex(0));
  };

  const handleSelect = useCallback(
    (nextIndex: typeof selectedWorkflowSchemaIndex, needSave: boolean) => {
      if (needSave) {
        setUnsavedWorkflowSchemaIndex(nextIndex);
      } else {
        flushSync(() => setSelectedWorkflowSchemaIndex(undefined));
        setSelectedWorkflowSchemaIndex(nextIndex);
      }
    },
    []
  );

  const onSaveMemoized = useCallback(
    (editedWorkflowSchema: WorkflowSchemaEditable) => {
      if (selectedWorkflowSchema) {
        onSave(
          convertEditableToWorkflowSchemaUpdate(
            editedWorkflowSchema,
            selectedWorkflowSchema
          )
        );
        setHasUnsavedChanges(false);
      }
    },
    [selectedWorkflowSchema]
  );

  return (
    <>
      <UnsavedChangesModal
        visible={unsavedWorkflowSchemaIndex !== false}
        onOk={() => {
          if (unsavedWorkflowSchemaIndex === false) return;
          flushSync(() => setSelectedWorkflowSchemaIndex(undefined));
          setSelectedWorkflowSchemaIndex(unsavedWorkflowSchemaIndex);
          setUnsavedWorkflowSchemaIndex(false);
        }}
        onCancel={() => setUnsavedWorkflowSchemaIndex(false)}
      />
      <DeleteModal
        title="Workflow Schema"
        visible={Boolean(workflowSchemaToDelete)}
        onOk={() => {
          if (!workflowSchemaToDelete) return;
          onDelete(workflowSchemaToDelete);
          setWorkflowSchemaToDelete(undefined);
        }}
        onCancel={() => setWorkflowSchemaToDelete(undefined)}
      />
      <StyledRow cols={2} gutter={0}>
        <Flex direction="column">
          <CommonHeader title="Workflow Schemas">
            <Button
              type="primary"
              aria-label="Create New Workflow Schema"
              onClick={handleCreate}
            >
              Create New
            </Button>
          </CommonHeader>
          <div style={{ padding: 16 }}>
            <WorkflowSchemaTable
              selectedIndex={selectedWorkflowSchemaIndex}
              hasUnsavedChanges={hasUnsavedChanges}
              data={workflowSchemas}
              onSave={onSave}
              onSelect={handleSelect}
              onDuplicate={handleDuplicate}
              onDelete={(workflowSchema) => {
                setWorkflowSchemaToDelete(workflowSchema);
                setSelectedWorkflowSchemaIndex(undefined);
              }}
            />
          </div>
        </Flex>
        <Flex
          direction="column"
          justifyContent={selectedWorkflowSchemaIndex ? undefined : 'center'}
          style={{
            borderLeft: '1px solid #D9D9D9',
            backgroundColor: 'var(--cogs-surface--medium)',
          }}
        >
          {selectedWorkflowSchema ? (
            <WorkflowSchemaEditor
              initialValue={convertWorkflowSchemaToEditable(
                selectedWorkflowSchema
              )}
              onHasUnsavedChanges={setHasUnsavedChanges}
              onSave={onSaveMemoized}
              onCancel={handleSelect}
            />
          ) : (
            <CommonError
              title="No Schema selected"
              buttonText="Create New"
              onButtonClick={handleCreate}
            >
              Please select a workflow schema from the panel.
              <br /> Or create a new schema.
            </CommonError>
          )}
        </Flex>
      </StyledRow>
    </>
  );
};
