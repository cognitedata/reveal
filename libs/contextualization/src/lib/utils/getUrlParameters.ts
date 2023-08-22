export const getUrlParameters = () => {
  const currentURL = window.location.href;
  const searchParams = new URLSearchParams(currentURL.split('?')[1]);
  const dataModel = searchParams.get('dataModel') || '';
  const space = searchParams.get('space') || '';
  const versionNumber = searchParams.get('versionNumber') || '';
  const type = searchParams.get('type') || '';
  const headerName = searchParams.get('headerName') || '';
  const dataModelType = searchParams.get('dataModelType') || '';
  const advancedJoinExternalId = searchParams.get('AdvancedJoinId') || '';

  return {
    dataModel,
    space,
    versionNumber,
    type,
    headerName,
    dataModelType,
    advancedJoinExternalId,
  };
};
