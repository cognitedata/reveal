import { type FdmSDK, type Source } from '../data-providers/FdmSDK';

export async function fdmViewsExist(fdmSdk: FdmSDK, neededViews: Source[]): Promise<boolean> {
  const views = await fdmSdk.getViewsByIds(neededViews);
  if (views.items.length === neededViews.length) {
    return true;
  }
  return false;
}
