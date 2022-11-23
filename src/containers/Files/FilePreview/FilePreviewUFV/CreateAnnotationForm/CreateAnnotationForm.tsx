import React from 'react';
import { Input, Button, Title, Icon, Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Loader, SpacedRow } from 'components';
import { renderTitle, lightGrey } from 'utils';
import { useCdfItem, SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { IdEither } from '@cognite/sdk';
import { convertResourceType } from 'types';
import {
  getExtendedAnnotationDescription,
  getExtendedAnnotationLabel,
  getResourceExternalIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
  setExtendedAnnotationDescription,
  setExtendedAnnotationLabel,
} from '../migration/utils';
import { ExtendedAnnotation } from '../types';

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

  const enabled = !!api && !!id;
  const { data: item, isFetched } = useCdfItem<any>(api!, id!, { enabled });

  if (enabled && !isFetched) {
    return <Loader />;
  }

  let buttonText = <>Not linked to a Resource</>;
  if (resourceType) {
    switch (resourceType) {
      case 'asset': {
        buttonText = (
          <>
            Linked to <Icon type="Assets" style={{ marginLeft: 4 }} />{' '}
            {item?.name || 'Asset'}
          </>
        );
        break;
      }
      case 'timeSeries': {
        buttonText = (
          <>
            Linked to <Icon type="Timeseries" style={{ marginLeft: 4 }} />{' '}
            {item?.name || 'Time series'}
          </>
        );
        break;
      }
      case 'sequence': {
        buttonText = (
          <>
            Linked to <Icon type="GridFilled" style={{ marginLeft: 4 }} />{' '}
            {item?.name || 'Sequence'}
          </>
        );
        break;
      }
      case 'file': {
        buttonText = (
          <>
            Linked to <Icon type="Document" style={{ marginLeft: 4 }} />{' '}
            {item?.name || 'File'}
          </>
        );
        break;
      }
      case 'event': {
        buttonText = (
          <>
            Linked to <Icon type="Events" style={{ marginLeft: 4 }} />{' '}
            {item ? renderTitle(item) : 'Event'}
          </>
        );
        break;
      }
    }
  }
  return (
    <Wrapper>
      <Title level={5}>{onCancel ? 'Edit tag' : 'Create tag'}</Title>
      {previewImageSrc && <PreviewImage src={previewImageSrc} alt="preview" />}
      <Body>{buttonText}</Body>
      <Button onClick={onLinkResource}>
        {resourceType ? (
          <>
            <Icon type="Edit" /> Edit Resource Link
          </>
        ) : (
          <>
            <Icon type="Plus" /> Link to Resource
          </>
        )}
      </Button>
      <Input
        variant="noBorder"
        placeholder="Label"
        value={getExtendedAnnotationLabel(annotation)}
        onChange={e =>
          updateAnnotation(
            setExtendedAnnotationLabel(annotation, e.target.value)
          )
        }
      />
      <Input
        variant="noBorder"
        placeholder="Description"
        value={getExtendedAnnotationDescription(annotation)}
        onChange={e =>
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
          Save
        </Button>
        <div style={{ flex: 1 }} />
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        {!onCancel ? (
          <Button onClick={onDelete} type="danger">
            Cancel
          </Button>
        ) : (
          <Button onClick={onDelete} icon="Delete" type="danger" />
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
