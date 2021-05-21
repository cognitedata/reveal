import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileToolbar } from 'src/modules/Workflow/components/FileToolbar';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { pushMetric } from 'src/utils/pushMetric';
import { ProcessResults } from 'src/modules/Process/Containers/ProcessResults';
import { ViewMode } from 'src/modules/Common/types';
import { hideFileMetadataPreview } from 'src/modules/Process/processSlice';
import { useDispatch } from 'react-redux';

pushMetric('Vision.Process');
const queryClient = new QueryClient();

export default function ProcessStep() {
  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState<string>('list');

  useEffect(() => {
    return () => {
      dispatch(hideFileMetadataPreview());
    };
  }, []);
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Title level={2}>Process and detect annotations</Title>
        <FileToolbar currentView={currentView} onViewChange={setCurrentView} />
        <Container>
          <ProcessResults currentView={currentView as ViewMode} />
        </Container>
      </QueryClientProvider>
    </>
  );
}

const Container = styled.div`
  flex: 1;
  height: calc(100% - 50px);
`;
