export type DataModelTransformation = {
  id: number;
  name: string;
  externalId: string;
  destination: {
    type: string;
    modelExternalId: string;
    spaceExternalId: string;
    instanceSpaceExternalId: string;
  };
};
