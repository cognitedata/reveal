import React, { useEffect } from 'react';

import styled from 'styled-components';

import { Body, Checkbox, Colors, Detail, Flex, Menu } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';
import { use3DRevisionsQuery } from '@data-exploration-lib/domain-layer';

import { SecondaryModelOptions } from '../../contexts/ThreeDContext';
import { formatTime } from '../../timestamp/ThreeDTimestamp';

export const SecondaryThreeDModelMenuItem = ({
  model,
  onChange,
  options,
}: {
  model: Model3D;
  onChange: (nextState: SecondaryModelOptions) => void;
  options?: SecondaryModelOptions;
}) => {
  const { t } = useTranslation();
  const { data: revisions = [], isFetched } = use3DRevisionsQuery(model.id);
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
    <StyledSecondaryObjectMenuItemContent gap={8}>
      <Checkbox
        checked={Boolean(options?.applied)}
        disabled={!revisions?.length}
        name={`model-${model.id}`}
        onChange={(_, c) => handleClickModelMenuItem(!!c)}
      />
      <Flex alignItems="flex-start" direction="column">
        <StyledSecondaryObjectBody $isSelected={options?.applied}>
          {model.name}
        </StyledSecondaryObjectBody>
        <StyledSecondaryObjectDetail>
          {selectedRevision ? (
            <>
              {`${t(
                'REVISION_WITH_INDEX',
                `Revision ${selectedRevision.index}`,
                {
                  index: selectedRevision.index,
                }
              )} - ${
                selectedRevision.published
                  ? t('PUBLISHED', 'Published')
                  : t('UNPUBLISHED', 'Unpublished')
              }`}
            </>
          ) : (
            <>-</>
          )}
        </StyledSecondaryObjectDetail>
      </Flex>
    </StyledSecondaryObjectMenuItemContent>
  );

  if (!isFetched || revisions?.length === 0) {
    return (
      <Menu.Item icon={!isFetched ? 'Loader' : undefined}>
        {menuItemContent}
      </Menu.Item>
    );
  }

  return (
    <Menu.Submenu
      content={
        <StyledMenu>
          {revisions?.map(({ createdTime, id, index, published }) => (
            <Menu.Item
              hideTooltip={true}
              toggled={id === options?.revisionId}
              description={
                published
                  ? t('PUBLISHED', 'Published')
                  : t(
                      'CREATED_WITH_TIME',
                      `Created: ${formatTime(createdTime.getTime())}`,
                      {
                        time: formatTime(createdTime.getTime()),
                      }
                    )
              }
              key={id}
              onClick={() => handleSelectRevision(id)}
            >
              {t('REVISION_WITH_INDEX', `Revision ${index}`, {
                index,
              })}
            </Menu.Item>
          ))}
        </StyledMenu>
      }
    >
      {menuItemContent}
    </Menu.Submenu>
  );
};

export const StyledSecondaryObjectBody = styled(Body).attrs({
  level: 2,
  strong: true,
})<{ $isSelected?: boolean }>`
  color: ${({ $isSelected }) =>
    $isSelected && Colors['text-icon--interactive--default']};
`;

export const StyledSecondaryObjectDetail = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

export const StyledMenu = styled(Menu)`
  max-height: 60vh;
  overflow-y: auto;
`;

export const StyledSecondaryObjectMenuItemContent = styled(Flex)`
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
