/*!
 * Copyright 2024 Cognite AS
 */
import { type FdmSDK, type Source } from './FdmSDK';

export async function fdmViewsExist(fdmSdk: FdmSDK, neededViews: Source[]): Promise<boolean> {
  const views = await fdmSdk.getViewsByIds(neededViews);
  if (views.items.length === neededViews.length) {
    return true;
  }
  return false;
}
