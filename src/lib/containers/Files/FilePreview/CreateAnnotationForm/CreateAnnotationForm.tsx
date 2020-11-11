import React from 'react';
import { Input, Button, Title, Icon, Body } from '@cognite/cogs.js';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import { Loader, SpacedRow } from 'lib/components';
import { CogniteAnnotation } from '@cognite/annotations';
import { renderTitle } from 'lib/utils/EventsUtils';
import { useCdfItem, SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { IdEither } from '@cognite/sdk';
import { convertResourceType } from 'lib/types';
import { lightGrey } from 'lib/utils/Colors';

const getId = (
  annotation?: ProposedCogniteAnnotation | CogniteAnnotation
): IdEither | undefined => {
  if (annotation?.resourceExternalId) {
    return { externalId: annotation.resourceExternalId };
  }
  if (annotation?.resourceId) {
    return { id: annotation?.resourceId };
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
  annotation: ProposedCogniteAnnotation | CogniteAnnotation;
  updateAnnotation: (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => void;
  onDelete: () => void;
  onCancel?: () => void;
  onSave: () => void;
  onLinkResource: () => void;
  previewImageSrc?: string;
  children?: React.ReactNode;
}) => {
  const id = getId(annotation);
  // @ts-ignore
  const api: SdkResourceType | undefined =
    // @ts-ignore
    annotation.resourceType && convertResourceType(annotation.resourceType);

  const enabled = !!api && !!id;
  const { data: item, isFetched } = useCdfItem<any>(api!, id!, { enabled });

  if (enabled && !isFetched) {
    return <Loader />;
  }

  let buttonText = <>Not linked to a Resource</>;
  if (annotation.resourceType) {
    switch (annotation.resourceType) {
      case 'asset': {
        buttonText = (
          <>
            Linked to <Icon type="DataStudio" style={{ marginLeft: 4 }} />{' '}
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
      <Title level={5}>
        {onCancel ? 'Edit annotation' : 'Create annotation'}
      </Title>
      {previewImageSrc && <PreviewImage src={previewImageSrc} alt="preview" />}
      <Body>{buttonText}</Body>
      <Button onClick={onLinkResource}>
        {annotation.resourceType ? (
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
        value={annotation.label}
        onChange={e =>
          updateAnnotation({ ...annotation, label: e.target.value })
        }
      />
      <Input
        variant="noBorder"
        placeholder="Description"
        value={annotation.description}
        onChange={e =>
          updateAnnotation({
            ...annotation,
            description: e.target.value,
          })
        }
      />
      <SpacedRow>
        <Button
          onClick={onSave}
          type="primary"
          icon={onCancel ? 'Check' : 'Plus'}
        >
          {onCancel ? 'Save' : 'Create'}
        </Button>
        <div style={{ flex: 1 }} />
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button onClick={onDelete} icon="Delete" type="danger" />
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
