import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  metaContentSchema,
  metaDescriptionSchema,
} from 'utils/validation/integrationSchemas';
import { Heading } from 'components/integration/ContactsSection';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { toCamelCase, uppercaseFirstWord } from 'utils/primitivesUtils';
import { EditField } from 'components/integration/EditField';
import { createUpdateSpec } from 'hooks/details/useDetailsUpdate';
import { Colors } from '@cognite/cogs.js';
import { useAppEnv } from 'hooks/useAppEnv';
import styled from 'styled-components';
import { RemoveFromArrayButton } from 'components/integration/RemoveFromArrayButton';
import {
  EXTRACTION_PIPELINE_LOWER,
  METADATA_CONTENT_HEADING,
  METADATA_CONTENT_LABEL,
  METADATA_DESC_HEADING,
  METADATA_DESCRIPTION_LABEL,
} from 'utils/constants';
import { AddMetadata } from './AddMetadata';

export const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 5rem;
  grid-column-gap: 0.5rem;
  align-items: center;
  input {
    width: 100%;
  }
  &:nth-child(even) {
    background-color: ${Colors['greyscale-grey2'].hex()};
    &:hover {
      background-color: ${Colors['greyscale-grey3'].hex()};
    }
  }
  [aria-expanded] {
    padding: 0.5rem;
    justify-self: end;
  }
`;

type MetadataEditType = { description: string; content: string };
export const EditMetaData: FunctionComponent = () => {
  const { project } = useAppEnv();
  const [metadata, setMetadata] = useState<MetadataEditType[]>([]);
  const { integration } = useSelectedIntegration();
  const { data: current } = useIntegrationById(integration?.id);

  useEffect(() => {
    if (current) {
      const meta = current.metadata
        ? Object.entries(current.metadata).map(([k, v]) => {
            return { description: uppercaseFirstWord(k), content: v };
          })
        : [];
      setMetadata(meta);
    }
  }, [current, setMetadata]);

  if (!current || !project) {
    return <p>No {EXTRACTION_PIPELINE_LOWER} information</p>;
  }
  return (
    <>
      <Row>
        <Heading>{METADATA_DESC_HEADING}</Heading>
        <Heading>{METADATA_CONTENT_HEADING}</Heading>
      </Row>
      {metadata.map((meta, index) => {
        const key = `meta-${index}`;
        return (
          <Row key={key} className="row-style-even">
            <EditField
              name="metadata"
              index={index}
              field="description"
              label={METADATA_DESCRIPTION_LABEL}
              schema={metaDescriptionSchema}
              defaultValues={{ description: meta?.description }}
              updateFunction={(field: any) => {
                const newMeta = metadata.reduce((acc, curr, i) => {
                  if (i === index) {
                    const metaKey = toCamelCase(field.description);
                    return { ...acc, [metaKey]: curr.content };
                  }
                  const metaKey = toCamelCase(curr.description);
                  return { ...acc, [metaKey]: curr.content };
                }, {});
                return createUpdateSpec({
                  id: current.id,
                  project,
                  fieldName: 'metadata',
                  fieldValue: newMeta,
                });
              }}
            />
            <EditField
              name="contacts"
              index={index}
              field="content"
              label={METADATA_CONTENT_LABEL}
              schema={metaContentSchema}
              defaultValues={{ content: meta?.content }}
              updateFunction={(field: any) => {
                const newMeta = metadata.reduce((acc, curr, i) => {
                  if (i === index) {
                    const metaKey = toCamelCase(curr.description);
                    return { ...acc, [metaKey]: field.content };
                  }
                  const metaKey = toCamelCase(curr.description);
                  return { ...acc, [metaKey]: curr.content };
                }, {});
                return createUpdateSpec({
                  id: current.id,
                  project,
                  fieldName: 'metadata',
                  fieldValue: newMeta,
                });
              }}
            />

            <RemoveFromArrayButton
              name="metadata"
              index={index}
              updateFunction={() => {
                const newMeta = metadata.reduce((acc, curr, i) => {
                  if (i === index) {
                    return { ...acc };
                  }
                  const metaKey = toCamelCase(curr.description);
                  return { ...acc, [metaKey]: curr.content };
                }, {});
                return createUpdateSpec({
                  id: current.id,
                  project,
                  fieldName: 'metadata',
                  fieldValue: newMeta,
                });
              }}
            />
          </Row>
        );
      })}
      <AddMetadata />
    </>
  );
};
