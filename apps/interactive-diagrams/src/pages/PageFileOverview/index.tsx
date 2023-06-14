import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Flex } from '@interactive-diagrams-app/components/Common';
import { useSteps, useActiveWorkflow } from '@interactive-diagrams-app/hooks';
import { retrieveItemsById as retrieve } from '@interactive-diagrams-app/modules/files';
import { WorkflowStep } from '@interactive-diagrams-app/modules/workflows';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

import { Icon } from '@cognite/cogs.js';
import { ErrorFeedback } from '@cognite/data-exploration';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { Wrapper } from './components';
import Preview from './Preview';
import SidebarDiagrams from './SidebarDiagrams';
import TitleBar from './TitleBar';

type Props = {
  step: WorkflowStep;
};

export default function PageFileOverview(props: Props) {
  const dispatch = useDispatch<ThunkDispatch<any, void, AnyAction>>();
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

  if (isError)
    return (
      <ErrorFeedback
        error={{
          message: error.message || '',
          status: 0,
        }}
      />
    );

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
          <Icon type="Loader" size={40} css={{ margin: '12px auto 0' }} />
        )}
      </Flex>
    </Wrapper>
  );
}
