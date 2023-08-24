import { useParams } from 'react-router-dom';

import { View } from '../../types';
import { extractPropertiesFromURL } from '../../utils/extractPropertiesFromURL';

import { useRetrieveViews } from './useRetrieveViews';

export const useCurrentView = () => {
  const { type, space: querySpace } = extractPropertiesFromURL();
  const { space: pathSpace = '' } = useParams();

  const space = pathSpace || querySpace || '';

  const { data: views } = useRetrieveViews(space, [type]);

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
