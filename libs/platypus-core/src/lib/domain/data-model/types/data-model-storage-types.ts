/**
 * DataModelStorageAPI types
 * Docs can be found here:
 * https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#tag/Models
 */

/**
 * The definition of a property. This is where you define its type and whether or not its nullable.
 */
export type DmsModelProperty = {
  /**
   * The type of property field.
   * Allowed types are text, json, boolean, float32, int, int64, timestamp, direct_relation.
   * You may also define array types for any of those types except direct_relation e.g. text[].
   */
  type: string;
  /**
   * Defines constraint on nullability of the field.
   * If true, this property may be set to null, indicating no value.
   * If false, this property must always have a value specified.
   */
  nullable: boolean;
  /**
   * A reference to a model. Consists of an array of spaceExternalId and modelExternalId.
   *  May also just reference [ edge ] or [ node ], which don't belong to any particular space.
   */
  targetModel?: [string, string];
};

export type DataModelStorageModel = {
  /** The model external id. */
  externalId: string;
  /** This model can be used on nodes. */
  allowNode?: boolean;
  /** This model can be used on edges. */
  allowEdge?: boolean;
  /** A group of property definitions. These define the schema of a model.
   * When ingesting to or querying from a model,
   * the group of properties will always include the inherited properties as well. */
  properties: {
    [propertyName: string]: DmsModelProperty;
  };
  /**
   * List of models that this model extends.
   */
  extends?: string[][];
  /**
   * Indexes for properties in this model. Currently only support B-tree indexes.
   */
  indexes?: {
    bTreeIndex: {
      [propertyName: string]: {
        properties: string[];
      };
    };
  };
  /**
   * Additional constraints for this model.
   */
  constraints?: {
    uniqueness: {
      [propertyName: string]: {
        uniqueProperties: { property: string }[];
      };
    };
  };
};
