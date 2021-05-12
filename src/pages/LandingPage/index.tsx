import React, { useState } from 'react';
import { Flex, Loader, PageTitle } from 'components/Common';
import { useAnnotatedFiles } from 'hooks';
import FilesList from './FilesList';

export default function LandingPage() {
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [loadChunk, setLoadChunk] = useState<number>(0);

  const { isLoading } = useAnnotatedFiles(shouldUpdate, loadChunk);

  return (
    <>
      <PageTitle>Interactive Engineering Diagrams</PageTitle>
      {isLoading ? (
        <Loading />
      ) : (
        <FilesList
          shouldUpdate={shouldUpdate}
          loadChunk={loadChunk}
          setShouldUpdate={setShouldUpdate}
          setLoadChunk={setLoadChunk}
        />
      )}
    </>
  );
}

const Loading = () => (
  <Flex style={{ height: '50vh' }}>
    <Loader />
  </Flex>
);
