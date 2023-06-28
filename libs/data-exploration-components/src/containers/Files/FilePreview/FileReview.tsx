import React, { useContext } from 'react';

import styled from 'styled-components';

import { ResourceIcons } from '@data-exploration-components/components';
import { Tooltip } from 'antd';

import { Body, Button, Flex, Icon } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import {
  AppContext,
  ExtendedAnnotation,
  useTranslation,
} from '@data-exploration-lib/core';

import {
  getResourceExternalIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  isAssetAnnotation,
  isFileAnnotation,
  isSuggestedAnnotation,
} from './migration/utils';

const FileReview = ({
  annotations,
  onApprove,
  onTypeClick,
}: {
  annotations: ExtendedAnnotation[];
  onApprove: (_annotations: ExtendedAnnotation[]) => void;
  onTypeClick: (type: 'assets' | 'files') => void;
}) => {
  const context = useContext(AppContext);
  const { t } = useTranslation();
  const { data: labelsReadAcl } = usePermissions(
    context?.flow! as any,
    'labelsAcl',
    'READ',
    undefined,
    { enabled: !!context?.flow }
  );
  const { data: labelsWriteAcl } = usePermissions(
    context?.flow! as any,
    'labelsAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  const labelsAccess = labelsReadAcl && labelsWriteAcl;

  const linkedAnnotations = annotations.filter(
    (annotation) =>
      getResourceIdFromExtendedAnnotation(annotation) !== undefined ||
      getResourceExternalIdFromExtendedAnnotation(annotation) !== undefined
  );
  const suggestedAnnotations = annotations.filter(isSuggestedAnnotation);
  const assetAnnotations = annotations.filter(isAssetAnnotation);
  const fileAnnotations = annotations.filter(isFileAnnotation);
  const suggestedAssetAnnotations =
    suggestedAnnotations.filter(isAssetAnnotation);
  const suggestedFileAnnotations =
    suggestedAnnotations.filter(isFileAnnotation);

  return (
    <ReviewTagWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Body level={2} strong>
          {t('ALL_TAGS', 'All tags')}
        </Body>

        <Body level={2}>{linkedAnnotations.length}</Body>
      </div>
      {suggestedAnnotations.length ? (
        <Tooltip
          title={
            !labelsAccess &&
            t(
              'MISSING_PERMISSIONS',
              'Missing permissions to approve tags, labels:read & labels:write'
            )
          }
        >
          <ButtonWrapper>
            <Button
              onClick={() => onApprove(annotations)}
              icon="Checkmark"
              style={{ width: '100%' }}
              type="tertiary"
              disabled={!labelsAccess}
            >
              {t(
                'APPROVE_NEW_TAGS',
                `Approve ${suggestedAnnotations.length} new tags`,
                { annotationLength: suggestedAnnotations.length }
              )}
            </Button>
          </ButtonWrapper>
        </Tooltip>
      ) : null}

      <StyledTag onClick={() => onTypeClick('assets')}>
        <Flex justifyContent="space-between">
          <ResourceIcons
            style={{
              marginTop: '-5px',
              background: 'transparent',
            }}
            type="asset"
          />
          <Body style={{ color: '#4255BB' }} level={2} strong>
            {t('ASSETS', 'Assets')}
          </Body>
          {suggestedAssetAnnotations.length ? (
            <Body
              level={2}
              style={{ color: '#4255BB', opacity: '0.7', marginLeft: '5px' }}
            >
              {suggestedAssetAnnotations.length} new
            </Body>
          ) : null}
        </Flex>
        <Flex>
          <Body level={5}>{assetAnnotations.length}</Body>
          <StyledIcon type="ChevronRight" />
        </Flex>
      </StyledTag>
      <StyledTag onClick={() => onTypeClick('files')}>
        <Flex justifyContent="space-between">
          <ResourceIcons
            style={{
              marginTop: '-5px',
              background: 'transparent',
            }}
            type="file"
          />{' '}
          <Body style={{ color: '#4255BB' }} level={2} strong>
            {t('DIAGRAMS', 'Diagrams')}
          </Body>
          {suggestedFileAnnotations.length ? (
            <Body
              level={2}
              style={{ color: '#4255BB', opacity: '0.7', marginLeft: '5px' }}
            >
              {suggestedFileAnnotations.length} new{' '}
            </Body>
          ) : null}
        </Flex>
        <Flex>
          <Body level={5}>{fileAnnotations.length}</Body>
          <StyledIcon type="ChevronRight" />
        </Flex>
      </StyledTag>
    </ReviewTagWrapper>
  );
};

export default FileReview;

const StyledIcon = styled(Icon)`
  margin-top: 3px;
`;

const ReviewTagWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cogs-border-default);
  padding: 12px;
  margin: 6px 0px 6px;
  border-radius: 8px;
`;

const StyledTag = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 8px 4px;
  width: 100%;
  background: var(--cogs-bg-hover);
  color: var(--cogs-text-info);
  margin: 6px 0px 6px;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid var(--cogs-midblue-5);
  cursor: pointer;
  :hover {
    background: var(--cogs-bg-selected);
  }
`;

const ButtonWrapper = styled.div`
  margin: 6px 0px 6px;
  width: 100%;
`;
