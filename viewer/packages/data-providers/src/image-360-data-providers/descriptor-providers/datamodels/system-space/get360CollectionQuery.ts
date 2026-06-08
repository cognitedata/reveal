/*!
 * Copyright 2023 Cognite AS
 */

const cdf360ImageSchemaSpace = 'cdf_360_image_schema';

const Image360CollectionQuery: {
    readonly with: {
        readonly image_collection: {
            readonly nodes: {
                readonly filter: {
                    readonly and: readonly [{
                        readonly equals: {
                            readonly property: readonly ["node", "externalId"];
                            readonly value: {
                                readonly parameter: "collectionExternalId";
                            };
                        };
                    }, {
                        readonly equals: {
                            readonly property: readonly ["node", "space"];
                            readonly value: {
                                readonly parameter: "collectionSpace";
                            };
                        };
                    }];
                };
            };
            readonly limit: 1;
        };
        readonly images: {
            readonly nodes: {
                readonly from: "image_collection";
                readonly through: {
                    readonly view: {
                        readonly type: "view";
                        readonly space: "cdf_360_image_schema";
                        readonly externalId: "Image360";
                        readonly version: "v1";
                    };
                    readonly identifier: "collection360";
                };
            };
            readonly limit: 10000;
        };
        readonly stations: {
            readonly nodes: {
                readonly from: "images";
                readonly through: {
                    readonly view: {
                        readonly type: "view";
                        readonly space: "cdf_360_image_schema";
                        readonly externalId: "Image360";
                        readonly version: "v1";
                    };
                    readonly identifier: "station";
                };
                readonly direction: "outwards";
            };
            readonly limit: 10000;
        };
    }; readonly select: {
        readonly image_collection: {
            readonly sources: readonly [{
                readonly source: {
                    readonly type: "view";
                    readonly space: "cdf_360_image_schema";
                    readonly externalId: "Image360Collection";
                    readonly version: "v1";
                };
                readonly properties: readonly ["label"];
            }];
        };
        readonly images: {
            readonly sources: readonly [{
                readonly source: {
                    readonly type: "view";
                    readonly space: "cdf_360_image_schema";
                    readonly externalId: "Image360";
                    readonly version: "v1";
                };
                readonly properties: readonly ["translationX", "translationY", "translationZ", "eulerRotationX", "eulerRotationY", "eulerRotationZ", "scaleX", "scaleY", "scaleZ", "cubeMapFront", "cubeMapBack", "cubeMapLeft", "cubeMapRight", "cubeMapTop", "cubeMapBottom", "collection360", "station", "timeTaken", "label"];
            }];
        };
        readonly stations: {
            readonly sources: readonly [{
                readonly source: {
                    readonly type: "view";
                    readonly space: "cdf_360_image_schema";
                    readonly externalId: "Station360";
                    readonly version: "v1";
                };
                readonly properties: readonly ["label"];
            }];
        };
    };
} = {
  with: {
    image_collection: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'collectionExternalId' }
              }
            },
            {
              equals: {
                property: ['node', 'space'],
                value: { parameter: 'collectionSpace' }
              }
            }
          ]
        }
      },
      limit: 1
    },
    images: {
      nodes: {
        from: 'image_collection',
        through: {
          view: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Image360',
            version: 'v1'
          },
          identifier: 'collection360'
        }
      },
      limit: 10000
    },
    stations: {
      nodes: {
        from: 'images',
        through: {
          view: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Image360',
            version: 'v1'
          },
          identifier: 'station'
        },
        direction: 'outwards'
      },
      limit: 10000
    }
  },
  select: {
    image_collection: {
      sources: [
        {
          source: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Image360Collection',
            version: 'v1'
          },
          properties: ['label']
        }
      ]
    },
    images: {
      sources: [
        {
          source: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Image360',
            version: 'v1'
          },
          properties: [
            'translationX',
            'translationY',
            'translationZ',
            'eulerRotationX',
            'eulerRotationY',
            'eulerRotationZ',
            'scaleX',
            'scaleY',
            'scaleZ',
            'cubeMapFront',
            'cubeMapBack',
            'cubeMapLeft',
            'cubeMapRight',
            'cubeMapTop',
            'cubeMapBottom',
            'collection360',
            'station',
            'timeTaken',
            'label'
          ]
        }
      ]
    },
    stations: {
      sources: [
        {
          source: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Station360',
            version: 'v1'
          },
          properties: ['label']
        }
      ]
    }
  }
} as const;

export type Cdf360FdmQuery = typeof Image360CollectionQuery;

export function get360CollectionQuery(
  externalId: string,
  space: string
): Cdf360FdmQuery & { parameters: { collectionExternalId: string; collectionSpace: string } } {
  return { ...Image360CollectionQuery, parameters: { collectionExternalId: externalId, collectionSpace: space } };
}
