import { type ReactElement } from 'react';
import { Image360HistoricalPanel } from './Panel/Image360HistoricalPanel';
import { Image360HistoricalSummary } from './Toolbar/Image360HistoricalSummary';
import styled from 'styled-components';
import { uniqueId } from 'lodash';
import { useImage360HistoricalDetailsViewModel } from './Image360HistoricalDetails.viewmodel';
import { type Image360HistoricalDetailsProps } from './types';

export const Image360HistoricalDetails = ({
  viewer,
  image360Entity,
  onExpand,
  fallbackLanguage
}: Image360HistoricalDetailsProps): ReactElement => {
  const {
    revisionDetailsExpanded,
    setRevisionDetailsExpanded,
    activeRevision,
    setActiveRevision,
    revisionCollection,
    minWidth,
    newScrollPosition,
    stationId,
    stationName
  } = useImage360HistoricalDetailsViewModel({
    viewer,
    image360Entity,
    onExpand,
    fallbackLanguage
  });

  return (
    <DetailsContainer style={{ minWidth }}>
      {
        <>
          <Image360HistoricalPanel
            key={uniqueId()}
            revisionCount={revisionCollection.length}
            revisionDetailsExpanded={revisionDetailsExpanded}
            setRevisionDetailsExpanded={setRevisionDetailsExpanded}
            fallbackLanguage={fallbackLanguage}
          />
          {revisionDetailsExpanded && (
            <Image360HistoricalSummary
              ref={newScrollPosition}
              key={uniqueId()}
              viewer={viewer}
              stationId={stationId}
              stationName={stationName}
              activeRevision={activeRevision}
              setActiveRevision={setActiveRevision}
              revisionCollection={revisionCollection}
              fallbackLanguage={fallbackLanguage}
            />
          )}
        </>
      }
    </DetailsContainer>
  );
};

const DetailsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: 100%;
`;
