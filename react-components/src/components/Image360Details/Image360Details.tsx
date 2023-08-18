/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Image360HistoricalDetails } from '../Image360HistoricalDetails/Image360HistoricalDetails';
import { useReveal } from '../..';
import { type Image360 } from '@cognite/reveal';
import { Button } from '@cognite/cogs.js';

export function Image360Details(): ReactElement {
  const viewer = useReveal();
  const [enteredEntity, setEnteredEntity] = useState<Image360 | undefined>();
  const [is360HistoricalPanelExpanded, setIs360HistoricalPanelExpanded] = useState<boolean>(false);
  const handleExpand = useCallback((isExpanded: boolean) => {
    setIs360HistoricalPanelExpanded(isExpanded);
  }, []);

  const clearEnteredImage360 = (): void => {
    setEnteredEntity(undefined);
  };

  const exitImage360Image = (): void => {
    viewer.exit360Image();
  };

  const collections = viewer.get360ImageCollections();

  useEffect(() => {
    collections.forEach((collection) => {
      collection.on('image360Entered', setEnteredEntity);
      collection.on('image360Exited', clearEnteredImage360);
    });
    return () => {
      collections.forEach((collection) => {
        collection.off('image360Entered', setEnteredEntity);
        collection.off('image360Exited', clearEnteredImage360);
      });
    };
  }, [viewer, collections]);

  return (
    <>
      {enteredEntity !== undefined && (
        <>
          <Image360HistoricalPanel isExpanded={is360HistoricalPanelExpanded}>
            <Image360HistoricalDetails
              viewer={viewer}
              image360Entity={enteredEntity}
              onExpand={handleExpand}
            />
          </Image360HistoricalPanel>
          <ExitButtonContainer>
            <StyledExitButton icon="CloseLarge" type="tertiary" onClick={exitImage360Image} />
          </ExitButtonContainer>
        </>
      )}
    </>
  );
}

const StyledExitButton = styled(Button)`
  border-radius: 8px;
`;

const ExitButtonContainer = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  background-color: #ffffff;
  height: 36px;
  width: 36px;
  border-radius: 8px;
  outline: none;
`;

const Image360HistoricalPanel = styled.div<{ isExpanded: boolean }>`
  position: absolute;
  bottom: ${({ isExpanded }) => (isExpanded ? '0px' : '40px')};
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: fit-content;
  max-width: 100%;
  min-width: fill-available;
  transition: transform 0.25s ease-in-out;
  transform: ${({ isExpanded }) => (isExpanded ? 'translateY(0)' : 'translateY(100%)')};
`;
