import { WorkflowSchemas } from 'pages/WorkflowSchemas/WorkflowSchemas';
import { useFetchWorkflowSchemas } from 'queries/useFetchWorkflowSchemas';
import { Loader, toast, ToastContainer } from '@cognite/cogs.js';
import { useUpdateWorkflowSchema } from 'queries/useUpdateWorkflowSchema';
import { useMemo } from 'react';
import { useDeleteWorkflowSchema } from 'queries/useDeleteWorkflowSchema';
import { useCreateWorkflowSchema } from 'queries/useCreateWorkflowSchema';

export const WorkflowSchemasContainer = () => {
  const {
    data: { workflowSchemas } = { workflowSchemas: [], count: 0 },
    isLoading: isLoadingWorkflowSchemas,
  } = useFetchWorkflowSchemas();

  const {
    mutate: handleCreate,
    isError: createError,
    isSuccess: createSuccessful,
  } = useCreateWorkflowSchema();

  const {
    mutate: handleSave,
    isError: updateError,
    isSuccess: updateSuccessful,
  } = useUpdateWorkflowSchema();

  const {
    mutate: handleDelete,
    isError: deleteError,
    isSuccess: deleteSuccessful,
  } = useDeleteWorkflowSchema();

  useMemo(() => {
    if (createError) toast.error('Failed to create');
  }, [createError]);
  useMemo(() => {
    if (updateError) toast.error('Failed to save');
  }, [updateError]);
  useMemo(() => {
    if (deleteError) toast.error('Failed to delete');
  }, [deleteError]);
  useMemo(() => {
    if (createSuccessful) toast.success('Workflow Schema Created Successfully');
  }, [createSuccessful]);
  useMemo(() => {
    if (updateSuccessful) toast.success('Workflow Schema Saved Successfully');
  }, [updateSuccessful]);
  useMemo(() => {
    if (deleteSuccessful) toast.success('Workflow Schema Deleted Successfully');
  }, [deleteSuccessful]);

  return (
    <>
      <ToastContainer autoClose={1500} />
      {isLoadingWorkflowSchemas ? (
        <Loader infoText="Loading Workflow Schemas" />
      ) : (
        <WorkflowSchemas
          workflowSchemas={workflowSchemas}
          onCreate={handleCreate}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};
