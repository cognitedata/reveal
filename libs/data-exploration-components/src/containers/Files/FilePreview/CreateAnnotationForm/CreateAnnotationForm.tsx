import React from 'react';

import styled from 'styled-components';

import { Loader } from '@data-exploration/components';

import { Input, Button, Title, Icon, Body } from '@cognite/cogs.js';
import { IdEither } from '@cognite/sdk';
import { useCdfItem, SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { ExtendedAnnotation, useTranslation } from '@data-exploration-lib/core';

import { SpacedRow } from '../../../../components';
import { convertResourceType } from '../../../../types';
import { renderTitle, lightGrey } from '../../../../utils';
import {
  getExtendedAnnotationDescription,
  getExtendedAnnotationLabel,
  getResourceExternalIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
  setExtendedAnnotationDescription,
  setExtendedAnnotationLabel,
} from '../migration';

const getResourceIdEither = (
  annotation?: ExtendedAnnotation
): IdEither | undefined => {
  if (annotation === undefined) {
    return undefined;
  }

  const externalId = getResourceExternalIdFromExtendedAnnotation(annotation);
  if (externalId) {
    return {
      externalId,
    };
  }

  const id = getResourceIdFromExtendedAnnotation(annotation);
  if (id) {
    return { id };
  }

  return undefined;
};

export const CreateAnnotationForm = ({
  annotation,
  updateAnnotation,
  onDelete,
  onSave,
  onCancel,
  onLinkResource,
  previewImageSrc,
  children,
}: {
  annotation: ExtendedAnnotation;
  updateAnnotation: (_annotation: ExtendedAnnotation) => void;
  onDelete: () => void;
  onCancel?: () => void;
  onSave: () => void;
  onLinkResource: () => void;
  previewImageSrc?: string;
  children?: React.ReactNode;
}) => {
  const id = getResourceIdEither(annotation);
  const resourceType = getResourceTypeFromExtendedAnnotation(annotation);
  const api: SdkResourceType | undefined =
    resourceType && convertResourceType(resourceType);
  const { t } = useTranslation();

  const enabled = !!api && !!id;
  const { data: item, isFetched } = useCdfItem<any>(api!, id!, { enabled });

  if (enabled && !isFetched) {
    return <Loader />;
  }

  let buttonText = (
    <>{t('NOT_LINKED_TO_A_RESOURCE', 'Not linked to a Resource')}</>
  );
  if (resourceType) {
    switch (resourceType) {
      case 'asset': {
        buttonText = (
          <>
            {t('LINKED_TO', 'Linked to')} <Icon type="Assets" />{' '}
            {item?.name || t('ASSET', 'Asset')}
          </>
        );
        break;
      }
      case 'timeSeries': {
        buttonText = (
          <>
            {t('LINKED_TO', 'Linked to')} <Icon type="Timeseries" />{' '}
            {item?.name || t('TIMESERIES', 'Time series')}
          </>
        );
        break;
      }
      case 'sequence': {
        buttonText = (
          <>
            {t('LINKED_TO', 'Linked to')} <Icon type="GridFilled" />{' '}
            {item?.name || t('SEQUENCE', 'Sequence')}
          </>
        );
        break;
      }
      case 'file': {
        buttonText = (
          <>
            {t('LINKED_TO', 'Linked to')} <Icon type="Document" />{' '}
            {item?.name || t('FILE', 'File')}
          </>
        );
        break;
      }
      case 'event': {
        buttonText = (
          <>
            {t('LINKED_TO', 'Linked to')} <Icon type="Events" />{' '}
            {item ? renderTitle(item) : t('EVENT', 'Event')}
          </>
        );
        break;
      }
    }
  }
  return (
    <Wrapper>
      <Title level={5}>
        {onCancel ? t('EDIT_TAG', 'Edit tag') : t('CREATE_TAG', 'Create tag')}
      </Title>
      {previewImageSrc && <PreviewImage src={previewImageSrc} alt="preview" />}
      <Body>{buttonText}</Body>
      <Button onClick={onLinkResource}>
        {resourceType ? (
          <>
            <Icon type="Edit" /> {t('EDIT_RESOURCE_LINK', 'Edit Resource Link')}
          </>
        ) : (
          <>
            <Icon type="Plus" /> {t('LINK_TO_RESOURCE', 'Link to Resource')}
          </>
        )}
      </Button>
      <Input
        variant="noBorder"
        placeholder={t('LABEL', 'Label')}
        value={getExtendedAnnotationLabel(annotation)}
        onChange={(e) =>
          updateAnnotation(
            setExtendedAnnotationLabel(annotation, e.target.value)
          )
        }
      />
      <Input
        variant="noBorder"
        placeholder={t('DESCRIPTION', 'Description')}
        value={getExtendedAnnotationDescription(annotation)}
        onChange={(e) =>
          updateAnnotation(
            setExtendedAnnotationDescription(annotation, e.target.value)
          )
        }
      />
      <SpacedRow style={{ gap: '10px' }}>
        <Button
          onClick={onSave}
          type="primary"
          icon="Save"
          disabled={
            getExtendedAnnotationLabel(annotation) === undefined ||
            getExtendedAnnotationLabel(annotation).length === 0
          }
        >
          {t('SAVE', 'Save')}
        </Button>
        <div style={{ flex: 1 }} />
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        {!onCancel ? (
          <Button onClick={onDelete} type="destructive">
            {t('CANCEL', 'Cancel')}
          </Button>
        ) : (
          <Button onClick={onDelete} icon="Delete" type="destructive" />
        )}
      </SpacedRow>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  width: 100%;

  && > * {
    margin-bottom: 8px;
  }
`;

const PreviewImage = styled.img`
  max-height: 200px;
  padding: 12px;
  background: ${lightGrey};
  width: auto;
  object-fit: contain;
`;
