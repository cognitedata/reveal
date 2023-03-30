import { Body, Flex } from '@cognite/cogs.js';

type ResourceCellProps = {
  resource?: Record<string, unknown>;
  preferredProperties?: string[];
};

const DEFAULT_PROPERTY_PREFERENCE_ORDER = ['name', 'externalId', 'description'];
const FALLBACK_PROPERTY = 'id';

const ResourceCell = ({
  preferredProperties,
  resource,
}: ResourceCellProps): JSX.Element => {
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
      return resource[property] && typeof resource[property] === 'string';
    }
  );

  return (
    <Flex direction="column">
      <Body level={3} muted>
        {preferredProperty ?? propertyPreferenceOrder[0]}
      </Body>
      <Body level={2}>
        {preferredProperty ? (resource[preferredProperty] as string) : '-'}
      </Body>
    </Flex>
  );
};

export default ResourceCell;
