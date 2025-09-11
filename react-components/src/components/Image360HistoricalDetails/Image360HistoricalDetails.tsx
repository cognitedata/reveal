import { useContext, type ReactElement } from 'react';
import styled from 'styled-components';
import { uniqueId } from 'lodash';
import { type Image360HistoricalDetailsProps } from './types';
import { Image360HistoricalDetailsContext } from './Image360HistoricalDetails.context';

export const Image360HistoricalDetails = ({
  viewer,
  image360Entity,
  onExpand,
  fallbackLanguage
}: Image360HistoricalDetailsProps): ReactElement => {
  const {
    Image360HistoricalPanel,
    Image360HistoricalSummary,
    useImage360HistoricalDetailsViewModel
  } = useContext(Image360HistoricalDetailsContext);

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
