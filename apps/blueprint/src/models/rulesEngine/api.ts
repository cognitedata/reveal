import { Asset, CogniteClient, Timeseries } from '@cognite/sdk';
import { ShapeAttribute } from 'typings/rules';

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
