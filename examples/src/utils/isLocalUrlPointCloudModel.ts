/**
 * Returns true if the URL provided points to a point cloud model.
 * @param addModelOptions 
 * @returns 
 */
export async function isLocalUrlPointCloudModel(modelBaseUrl: string) {
  // The hacky check below is due to webpack-dev-server returning 200 for non-existing files. We therefore check if the 
  // response is a valid json.
  const eptJsonRequest = await fetch(modelBaseUrl + '/ept.json');
  try {
    if (eptJsonRequest.ok) {
      await eptJsonRequest.json();
    } else {
      return false;
    }
  } catch (_e) {
    return false;
  }
  return true;
}
