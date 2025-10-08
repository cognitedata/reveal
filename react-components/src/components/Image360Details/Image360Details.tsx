import { useState, type ReactElement, useCallback, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { type DataSourceType, type Image360 } from '@cognite/reveal';
import { Button, CloseLargeIcon } from '@cognite/cogs.js';
import { Image360DetailsContext } from './Image360Details.context';

type Image360DetailsProps = {
  appLanguage?: string;
  enableExitButton?: boolean;
};

export function Image360Details({
  appLanguage,
  enableExitButton = true
}: Image360DetailsProps): ReactElement {
  const { useReveal, useImage360Collections, Image360HistoricalDetails } =
    useContext(Image360DetailsContext);

  const viewer = useReveal();
  const [enteredEntity, setEnteredEntity] = useState<Image360<DataSourceType> | undefined>();
  const [is360HistoricalPanelExpanded, setIs360HistoricalPanelExpanded] = useState<boolean>(false);
  const handleExpand = useCallback((isExpanded: boolean) => {
    setIs360HistoricalPanelExpanded(isExpanded);
  }, []);

  const clearEnteredImage360 = useCallback((): void => {
    setEnteredEntity(undefined);
  }, [setEnteredEntity]);

  const exitImage360Image = useCallback((): void => {
    viewer.exit360Image();
  }, [viewer]);

  const collections = useImage360Collections();

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
  }, [viewer, collections, setEnteredEntity, clearEnteredImage360]);

  return (
    <>
      {enteredEntity !== undefined && (
        <>
          <Image360HistoricalPanel isExpanded={is360HistoricalPanelExpanded}>
            <Image360HistoricalDetails
              viewer={viewer}
              image360Entity={enteredEntity}
              onExpand={handleExpand}
              fallbackLanguage={appLanguage}
            />
          </Image360HistoricalPanel>
          {enableExitButton && (
            <ExitButtonContainer>
              <StyledExitButton
                data-testid="image-360-details-exit-button"
                icon=<CloseLargeIcon />
                type="tertiary"
                onClick={exitImage360Image}
              />
            </ExitButtonContainer>
          )}
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
  min-width: 100%;
  transition: transform 0.25s ease-in-out;
  transform: ${({ isExpanded }) => (isExpanded ? 'translateY(0)' : 'translateY(100%)')};
  z-index: 100;
`;
