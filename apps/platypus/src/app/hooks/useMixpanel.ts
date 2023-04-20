import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { getCluster, getProject } from '@cognite/cdf-utilities';
import config from '@platypus-app/config/config';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import mixpanel, { Dict } from 'mixpanel-browser';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { environment } from '../../environments/environment';

// https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3929277073/User+Metrics+-+Mixpanel
export type TRACKING_TOKENS =
  | 'DataModel.NoPermission'
  | 'DataModel.List'
  | 'DataModel.Select'
  | 'DataModel.Create'
  | 'DataModel.Delete'
  | 'DataModel.Move'
  | 'DataModel.Visualize'
  | 'DataModel.Edit'
  | 'DataModel.Publish'
  | 'DataModel.Draft.Delete'
  | 'DataModel.Versions.List'
  | 'DataModel.Versions.Select'
  | 'DataModel.Data.View'
  | 'DataModel.Data.Search'
  | 'DataModel.Data.Filter'
  | 'DataModel.Data.Sort'
  | 'DataModel.Transformations.Create'
  | 'DataModel.Transformations.Open'
  | 'DataModel.GraphIQL.Run'
  | 'DataModel.ErrorMessage'
  | 'DataModel.Links.GraphQL'
  | 'DataModel.Links.CLI'
  | 'DataModel.Links.Documentation'
  // custom features
  | 'FeatureFlag.Toggle'
  // manual population
  | 'ManualPopulation.Create'
  | 'ManualPopulation.Update'
  | 'ManualPopulation.Delete'
  // suggestions
  | 'Suggestions.Approve'
  | 'Suggestions.Reject'
  | 'Suggestions.Open'
  | 'Suggestions.Save'
  // extra path tracking
  | 'UIEditor'
  | 'Navigate';

mixpanel.init(config.MIXPANEL_TOKEN);

export const useMixpanel = () => {
  const { data: user } = useQuery(
    QueryKeys.AUTHENTICATED_USER,
    getUserInformation,
    {
      staleTime: Infinity,
      enabled:
        environment.APP_ENV !== 'development' && environment.APP_ENV !== 'mock',
      onSuccess: (user) => {
        if (process.env.NODE_ENV !== 'production') {
          return;
        }
        mixpanel.identify(user?.id);
        mixpanel.people.set({
          email: user?.mail || user?.userPrincipalName || user?.displayName,
          cluster: getCluster(),
          project: getProject(),
        });
      },
    }
  );
  return useMemo(
    () => ({
      track: async (eventName: TRACKING_TOKENS, properties?: Dict) => {
        if (process.env.NODE_ENV !== 'production') {
          return;
        }
        mixpanel.identify(user?.id);
        mixpanel.track(eventName, {
          cluster: getCluster(),
          project: getProject(),
          ...properties,
        });
      },
    }),
    [user]
  );
};

export const useMixpanelPathTracking = () => {
  const { track } = useMixpanel();
  const { pathname } = useLocation();
  const params = useParams();
  useEffect(() => {
    track('Navigate', {
      pathname,
      url: window.location.href,
      ...Object.entries(params).reduce(
        (prev, [key, value]) => ({
          ...prev,
          [`params-${key}`]: value as string,
        }),
        {} as { [key in string]: string }
      ),
    });
  }, [pathname, params, track]);
};
