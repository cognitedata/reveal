import React, { useMemo } from 'react';

import styled from 'styled-components';

import isUndefined from 'lodash/isUndefined';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Button, Icon, Link } from '@cognite/cogs.js';

import { ExtendedAnnotation, useTranslation } from '@data-exploration-lib/core';

import { ResourceIcons } from '../../../components';
import { ResourceType } from '../../../types';
import { capitalizeFirstLetter } from '../../../utils';

import {
  getExtendedAnnotationLabel,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
  isSuggestedAnnotation,
} from './migration';

const ReviewTagBar = ({
  annotation,
  onApprove,
  onReject,
}: {
  annotation: ExtendedAnnotation;
  onApprove: (annotation: ExtendedAnnotation) => void;
  onReject: (annotation: ExtendedAnnotation) => void;
}) => {
  const { t } = useTranslation();
  const resourceType = getResourceTypeFromExtendedAnnotation(annotation);

  const resourceLink = useMemo(() => {
    const resourceId = getResourceIdFromExtendedAnnotation(annotation);

    if (isUndefined(resourceType) || isUndefined(resourceId)) {
      return undefined;
    }

    return createLink(`/explore/${resourceType}/${resourceId}`);
  }, [annotation, resourceType]);

  return (
    <ReviewTagWrapper>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {resourceType && (
          <ResourceIcons
            type={resourceType as ResourceType}
            style={{
              background: 'white',
              color: 'black',
              marginTop: '-5px',
            }}
          />
        )}
        <Body level={2} strong>
          {resourceType
            ? t(
                resourceType.toUpperCase(),
                capitalizeFirstLetter(resourceType) || resourceType
              )
            : t('UNLINKED_TAG', 'Unlinked tag')}
        </Body>
      </div>
      <StyledTag>
        {getExtendedAnnotationLabel(annotation) || t('NOT_AVAILABLE', 'N/A')}{' '}
        {resourceLink && (
          <Link href={resourceLink} target="_blank">
            <StyledIcon type="ArrowUpRight" />
          </Link>
        )}
      </StyledTag>

      {isSuggestedAnnotation(annotation) && (
        <>
          <ButtonWrapper>
            <Button
              onClick={() => onApprove(annotation)}
              type="primary"
              icon="Checkmark"
              style={{ width: '100%' }}
            >
              {t('APPROVE_TAG_TEXT', 'Approve tag')}
            </Button>
          </ButtonWrapper>
          <ButtonWrapper>
            <Button
              onClick={() => onReject(annotation)}
              type="secondary"
              icon="Close"
              style={{ width: '100%' }}
            >
              {t('REJECT_TAG_TEXT', 'Reject tag')}
            </Button>
          </ButtonWrapper>
        </>
      )}
    </ReviewTagWrapper>
  );
};

export default ReviewTagBar;

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
  align-items: flex-start;
  padding: 6px 8px 8px;
  width: 100%;
  background: var(--cogs-bg-hover);
  color: var(--cogs-text-info);
  margin: 6px 0px 6px;
  border: 1px solid var(--cogs-link-inverted-default);
  border-radius: 8px;
  box-sizing: border-box;
`;

const ButtonWrapper = styled.div`
  margin: 6px 0px 6px;
  width: 100%;
`;

const StyledIcon = styled(Icon)`
  margin-bottom: -4px;
  margin-left: 4px;
`;
