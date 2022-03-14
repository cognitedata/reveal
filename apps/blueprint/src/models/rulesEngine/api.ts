import { Asset, CogniteClient, Timeseries } from '@cognite/sdk';
import { ShapeAttribute } from 'typings';

export const resolveAttributeValue = async (
  client: CogniteClient,
  attribute: ShapeAttribute
) => {
  let resource;
  if (attribute.type === 'TIMESERIES') {
    resource = await client.timeseries
      .retrieve([{ externalId: attribute.externalId }])
      .then((res) => res[0]);
  }

  if (attribute.type === 'ASSET') {
    resource = await client.assets
      .retrieve([{ externalId: attribute.externalId }])
      .then((res) => res[0]);
  }
  if (!resource)
    throw new Error(
      `No ${attribute.type} found with external id: ${attribute.externalId}`
    );

  return resolveAttributeValueFromResource(client, attribute, resource);
};

export const resolveAttributeValueFromResource = async (
  client: CogniteClient,
  attribute: ShapeAttribute,
  resource: Asset | Timeseries
) => {
  const { extractor, subExtractor } = attribute;
  if (extractor === 'METADATA') {
    const value = resource.metadata?.[subExtractor || ''];
    if (!value) {
      throw new Error('Field does not exist on resource');
    }
    return value;
  }

  if (extractor === 'CURRENT_VALUE') {
    const datapoint = await client.datapoints
      .retrieveLatest([{ before: 'now', id: resource.id }])
      .then((res) => res[0].datapoints[0]?.value);
    if (!datapoint) {
      throw new Error('Datapoint does not exist');
    }
    return datapoint;
  }

  throw new Error('Invalid attribute');
};
