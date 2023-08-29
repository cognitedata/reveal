import { useParams } from 'react-router-dom';

import { View } from '../../types';
import { getUrlParameters } from '../../utils/getUrlParameters';

import { useCurrentView } from './useCurrentView';
import { useRetrieveViews } from './useRetrieveViews';

export const useCurrentLinkedView = () => {
  const view = useCurrentView();
  const { headerName } = getUrlParameters();

  const property = view?.properties[headerName];
  const source = property?.type.source;

  const { data: views } = useRetrieveViews(
    source?.space,
    source && [source.externalId]
  );

  const latestView = views?.reduce(
    (latestView: View | undefined, view: View) => {
      if (
        latestView === undefined ||
        view.createdTime > latestView.createdTime
      ) {
        return view;
      } else {
        return latestView;
      }
    },
    undefined
  );

  return latestView;
};
