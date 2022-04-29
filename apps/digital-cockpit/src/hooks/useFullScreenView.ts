import { CogniteInternalId } from '@cognite/sdk';
import isNil from 'lodash/isNil';
import { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export default () => {
  // get search query from url
  const { search } = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(search), [search]);
  const history = useHistory();

  const fullScreenURLParams = useMemo(() => {
    const fsParam = urlParams.get('fullscreen');
    const fullScreen =
      !isNil(fsParam) && fsParam !== 'false' && fsParam !== '0';
    const docId = fullScreen ? urlParams.get('docid') : undefined;
    const timeseriesId = fullScreen
      ? urlParams.get('timeseriesid') || urlParams.get('tsid')
      : undefined;

    return {
      fullScreen,
      docId,
      timeseriesId,
    };
  }, [urlParams]);

  const clearUrlParams = () => {
    urlParams.delete('fullscreen');
    urlParams.delete('docid');
    urlParams.delete('timeseriesid');
    urlParams.delete('tsid');
    history.replace({
      search: urlParams.toString(),
    });
  };

  const goToFullScreen = (params: { [key: string]: CogniteInternalId }) => {
    urlParams.set('fullscreen', '');
    Object.keys(params).forEach((key) => urlParams.set(key, `${params[key]}`));
    history.replace({
      search: urlParams.toString(),
    });
  };

  const openTimeSeriesView = (tsid: CogniteInternalId) =>
    goToFullScreen({ tsid });
  const openDocumentView = (docid: CogniteInternalId) =>
    goToFullScreen({ docid });

  return {
    openTimeSeriesView,
    openDocumentView,
    urlParams: fullScreenURLParams,
    clearUrlParams,
  };
};
