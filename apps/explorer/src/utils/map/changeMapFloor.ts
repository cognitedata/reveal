import {
  PropertyFilterNodeCollection,
  DefaultNodeAppearance,
  Cognite3DModel,
  InvertedNodeCollection,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

export const changeMapFloor = (
  client: CogniteClient,
  model: Cognite3DModel,
  floorName: string
) => {
  const currFloor = new PropertyFilterNodeCollection(
    // @ts-expect-error client needs updates
    client,
    model
  );
  currFloor.executeFilter({ Item: { Name: floorName } });
  const notCurrFloor = new InvertedNodeCollection(model, currFloor);

  model.assignStyledNodeCollection(notCurrFloor, DefaultNodeAppearance.Hidden);
  model.assignStyledNodeCollection(currFloor, DefaultNodeAppearance.Default);
};
