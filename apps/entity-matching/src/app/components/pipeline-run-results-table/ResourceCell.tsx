import styled from 'styled-components';

import { Body, Colors, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

type ResourceCellProps = {
  preferredProperties?: string[];
  resource?: Record<string, unknown>;
  showId?: boolean;
};

const DEFAULT_PROPERTY_PREFERENCE_ORDER = ['name', 'externalId', 'description'];
const FALLBACK_PROPERTY = 'id';

const ResourceCell = ({
  preferredProperties,
  resource,
  showId,
}: ResourceCellProps): JSX.Element => {
  const { t } = useTranslation();
  if (!resource) {
    return <>-</>;
  }

  const propertyPreferenceOrder =
    preferredProperties && preferredProperties.length > 0
      ? preferredProperties
      : [
          ...DEFAULT_PROPERTY_PREFERENCE_ORDER,
          ...Object.keys(resource),
          FALLBACK_PROPERTY,
        ];

  const preferredProperty: string | undefined = propertyPreferenceOrder.find(
    (property) => {
      return resource[property];
    }
  );

  if (!preferredProperty) {
    return (
      <Flex direction="column">
        <Body level={3} muted>
          {propertyPreferenceOrder[0]}
        </Body>
        <Body level={2}>-</Body>
      </Flex>
    );
  }

  const value = resource[preferredProperty] as string;

  return (
    <Flex direction="column">
      <Body level={3} muted>
        {preferredProperty}
      </Body>
      <Body level={2}>{value}</Body>
      {showId ? <MutedId>{`${t('id')}: (${resource.id})`}</MutedId> : null}
    </Flex>
  );
};

const MutedId = styled.span`
  font-size: 0.8em;
  color: ${Colors['text-icon--muted']};
`;

export default ResourceCell;
