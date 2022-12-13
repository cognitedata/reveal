import React, { useEffect } from 'react';

import { Body, Checkbox, Colors, Detail, Flex, Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';
import styled from 'styled-components';

import ThreeDTimestamp from '@data-exploration-app/containers/ThreeD/timestamp/ThreeDTimestamp';
import { useRevisions } from '@data-exploration-app/containers/ThreeD/hooks';
import { SecondaryModelOptions } from '@data-exploration-app/containers/ThreeD/ThreeDContext';

export const SecondaryThreeDModelMenuItem = ({
  model,
  onChange,
  options,
}: {
  model: Model3D;
  onChange: (nextState: SecondaryModelOptions) => void;
  options?: SecondaryModelOptions;
}) => {
  const { data: revisions = [], isFetched } = useRevisions(model.id);
  const defaultRevision = revisions
    ? revisions.find(({ published }) => published) ?? revisions[0]
    : undefined;

  const selectedRevision = revisions?.find(
    ({ id }) => id === options?.revisionId
  );

  useEffect(() => {
    if (isFetched && !options && defaultRevision) {
      onChange({
        modelId: model.id,
        revisionId: defaultRevision.id,
        applied: false,
      });
    }
  }, [defaultRevision, isFetched, model, onChange, options]);

  const handleClickModelMenuItem = (checked: boolean): void => {
    if (options) {
      onChange({
        ...options,
        applied: checked,
      });
    }
  };

  const handleSelectRevision = (selectedRevisionId: number): void => {
    onChange({
      modelId: model.id,
      revisionId: selectedRevisionId,
      applied: true,
    });
  };

  const menuItemContent = (
    <StyledMenuItemContent gap={8}>
      <Checkbox
        checked={!!options?.applied}
        disabled={!revisions?.length}
        name={`model-${model.id}`}
        onChange={(c) => handleClickModelMenuItem(c)}
      />
      <Flex alignItems="flex-start" direction="column">
        <StyledSecondaryThreeDModelBody $isSelected={options?.applied}>
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
        <StyledMenu>
          {revisions?.map(({ createdTime, id, index, published }) => (
            <StyledRevisionMenuItem
              $isSelected={id === options?.revisionId}
              appendIcon={id === options?.revisionId ? 'Checkmark' : undefined}
              key={id}
              onClick={() => handleSelectRevision(id)}
            >
              <StyledMenuItemContent alignItems="flex-start" direction="column">
                <StyledSecondaryThreeDModelBody
                  $isSelected={id === options?.revisionId}
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
        </StyledMenu>
      }
    >
      {menuItemContent}
    </Menu.Submenu>
  );
};

export const StyledSecondaryThreeDModelBody = styled(Body).attrs({
  level: 2,
  strong: true,
})<{ $isSelected?: boolean }>`
  color: ${({ $isSelected }) =>
    $isSelected && Colors['text-icon--interactive--default']};
`;

export const StyledSecondaryThreeDModelDetail = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

export const StyledMenu = styled(Menu)`
  max-height: 60vh;
  overflow-y: auto;
`;

export const StyledMenuItemContent = styled(Flex)`
  margin-right: 16px;
`;

export const StyledRevisionMenuItem = styled(Menu.Item)<{
  $isSelected?: boolean;
}>`
  min-height: 52px;

  .cogs-icon {
    color: ${({ $isSelected }) =>
      $isSelected && Colors['text-icon--interactive--default']};
  }
`;
