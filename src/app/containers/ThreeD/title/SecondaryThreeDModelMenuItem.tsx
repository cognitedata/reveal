import React, { useEffect } from 'react';

import { Body, Checkbox, Colors, Detail, Flex, Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';
import styled from 'styled-components';

import ThreeDTimestamp from 'app/containers/ThreeD/timestamp/ThreeDTimestamp';
import { useRevisions } from 'app/containers/ThreeD/hooks';
import { SecondaryModelState } from 'app/containers/ThreeD/title/ThreeDTitle';

export const SecondaryThreeDModelMenuItem = ({
  model,
  setState,
  state,
}: {
  model: Model3D;
  setState: (nextState: SecondaryModelState[number]) => void;
  state?: SecondaryModelState[number];
}) => {
  const { data: revisions = [], isFetched } = useRevisions(model.id);
  const defaultRevision = revisions
    ? revisions.find(({ published }) => published) ?? revisions[0]
    : undefined;

  const selectedRevision = revisions?.find(
    ({ id }) => id === state?.revisionId
  );

  useEffect(() => {
    if (isFetched && !state) {
      setState({
        revisionId: defaultRevision?.id,
        selected: false,
      });
    }
  }, [defaultRevision, isFetched, revisions, setState, state]);

  const handleClickModelMenuItem = (checked: boolean): void => {
    setState({
      ...state,
      selected: checked,
    });
  };

  const handleSelectRevision = (selectedRevisionId: number): void => {
    setState({
      selected: true,
      revisionId: selectedRevisionId,
    });
  };

  const menuItemContent = (
    <StyledMenuItemContent gap={8}>
      <Checkbox
        checked={!!state?.selected}
        disabled={!revisions?.length}
        name={`model-${model.id}`}
        onChange={c => handleClickModelMenuItem(c)}
      />
      <Flex alignItems="flex-start" direction="column">
        <StyledSecondaryThreeDModelBody $isSelected={state?.selected}>
          {model.name}
        </StyledSecondaryThreeDModelBody>
        <StyledSecondaryThreeDModelDetail>
          {selectedRevision ? (
            <>
              {`Revision ${selectedRevision.index} - ${
                selectedRevision.published ? 'Published' : 'Unpublished'
              }`}
            </>
          ) : (
            <>-</>
          )}
        </StyledSecondaryThreeDModelDetail>
      </Flex>
    </StyledMenuItemContent>
  );

  if (!isFetched || revisions?.length === 0) {
    return (
      <Menu.Item appendIcon={!isFetched ? 'Loader' : undefined}>
        {menuItemContent}
      </Menu.Item>
    );
  }

  return (
    <Menu.Submenu
      content={
        <Menu>
          {revisions?.map(({ createdTime, id, index, published }) => (
            <StyledRevisionMenuItem
              $isSelected={id === state?.revisionId}
              appendIcon={id === state?.revisionId ? 'Checkmark' : undefined}
              key={id}
              onClick={() => handleSelectRevision(id)}
            >
              <StyledMenuItemContent alignItems="flex-start" direction="column">
                <StyledSecondaryThreeDModelBody
                  $isSelected={id === state?.revisionId}
                >
                  Revision {index}
                </StyledSecondaryThreeDModelBody>
                <StyledSecondaryThreeDModelDetail>
                  {published ? (
                    'Published'
                  ) : (
                    <>
                      Created:{' '}
                      <ThreeDTimestamp timestamp={createdTime.getTime()} />
                    </>
                  )}
                </StyledSecondaryThreeDModelDetail>
              </StyledMenuItemContent>
            </StyledRevisionMenuItem>
          ))}
        </Menu>
      }
    >
      {menuItemContent}
    </Menu.Submenu>
  );
};

const StyledSecondaryThreeDModelBody = styled(Body).attrs({
  level: 2,
  strong: true,
})<{ $isSelected?: boolean }>`
  color: ${({ $isSelected }) =>
    $isSelected && Colors['text-icon--interactive--default']};
`;

const StyledSecondaryThreeDModelDetail = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

const StyledMenuItemContent = styled(Flex)`
  margin-right: 16px;
`;

const StyledRevisionMenuItem = styled(Menu.Item)<{ $isSelected?: boolean }>`
  .cogs-icon {
    color: ${({ $isSelected }) =>
      $isSelected && Colors['text-icon--interactive--default']};
  }
`;
