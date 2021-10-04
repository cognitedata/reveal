import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import { ErrorFeedback, Loader } from '@cognite/data-exploration';
import { useSteps, useActiveWorkflow } from 'hooks';
import { WorkflowStep } from 'modules/workflows';
import { retrieveItemsById as retrieve } from 'modules/files';
import { Flex } from 'components/Common';
import { Wrapper } from './components';
import SidebarDiagrams from './SidebarDiagrams';
import SidebarResource from './SidebarResource';
import TitleBar from './TitleBar';
import Preview from './Preview';

type Props = {
  step: WorkflowStep;
};

export default function PageFileOverview(props: Props) {
  const dispatch = useDispatch();
  const { step } = props;
  const { fileId } = useParams<{ fileId: string }>();
  const { goToPrevStep } = useSteps(step);
  const [editMode, setEditMode] = useState<boolean>(false);

  useActiveWorkflow(step);

  const fileIdNumber = Number(fileId);
  if (!fileIdNumber) goToPrevStep();

  const {
    data: fileInfo,
    isFetched,
    isError,
    error,
  } = useCdfItem<FileInfo>('files', {
    id: fileIdNumber,
  });

  const showPreview = isFetched && fileInfo;

  useEffect(() => {
    dispatch(retrieve({ ids: [{ id: fileIdNumber }] }));
  }, [dispatch, fileIdNumber]);

  if (isError) return <ErrorFeedback error={error} />;

  return (
    <Wrapper>
      <SidebarDiagrams />
      <Flex column style={{ width: '100%', height: '100%' }}>
        <TitleBar
          file={fileInfo}
          step={step}
          editMode={editMode}
          setEditMode={setEditMode}
        />
        {showPreview ? (
          <Preview file={fileInfo!} editMode={editMode} />
        ) : (
          <Loader />
        )}
        <SidebarResource />
      </Flex>
    </Wrapper>
  );
}
