export const getUrlParameters = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const cluster = searchParams.get('cluster') || '';
  const env = searchParams.get('env') || '';
  const dataModelExternalId = searchParams.get('dataModelExternalId') || '';
  const space = searchParams.get('space') || '';
  const versionNumber = searchParams.get('versionNumber') || '';
  const type = searchParams.get('type') || '';
  const headerName = searchParams.get('headerName') || '';
  const dataModelType = searchParams.get('dataModelType') || '';
  const advancedJoinExternalId = searchParams.get('AdvancedJoinId') || '';

  return {
    cluster,
    env,
    dataModelExternalId,
    space,
    versionNumber,
    type,
    headerName,
    dataModelType,
    advancedJoinExternalId,
  };
};
