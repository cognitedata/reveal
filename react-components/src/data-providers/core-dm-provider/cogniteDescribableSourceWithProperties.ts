import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_DESCRIBABLE_SOURCE } from './dataModels';

export const cogniteDescribableSourceWithProperties: [{
    readonly source: {
        readonly externalId: "CogniteDescribable";
        readonly space: "cdf_cdm";
        readonly version: "v1";
        readonly type: "view";
    };
    readonly properties: ["name", "description", "tags", "aliases"];
}] = [
  {
    source: COGNITE_DESCRIBABLE_SOURCE,
    properties: ['name', 'description', 'tags', 'aliases']
  }
] as const satisfies SourceSelectorV3;
