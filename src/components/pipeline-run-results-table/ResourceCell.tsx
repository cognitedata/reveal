import { Body, Flex } from '@cognite/cogs.js';
import HighlightedRegex from 'components/highlighted-regex';
import { MatchColorsByGroupIndex } from './ExpandedRule';

type ResourceCellProps = {
  matchColorsByGroupIndex?: MatchColorsByGroupIndex;
  pattern?: string;
  preferredProperties?: string[];
  resource?: Record<string, unknown>;
};

const DEFAULT_PROPERTY_PREFERENCE_ORDER = ['name', 'externalId', 'description'];
const FALLBACK_PROPERTY = 'id';

const ResourceCell = ({
  matchColorsByGroupIndex,
  pattern,
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
      <Body level={2}>
        {pattern && matchColorsByGroupIndex ? (
          <HighlightedRegex
            matchColorsByGroupIndex={matchColorsByGroupIndex}
            pattern={pattern}
            text={value}
          />
        ) : (
          value
        )}
      </Body>
    </Flex>
  );
};

export default ResourceCell;
