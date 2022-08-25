import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { getCluster, getProject } from '@cognite/cdf-utilities';
import config from '@platypus-app/config/config';
import mixpanel, { Dict } from 'mixpanel-browser';
import { useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch } from 'react-router-dom';

export type TRACKING_TOKENS =
  | 'UIEditor'
  | 'BreakingChanges'
  | 'CodeEditor'
  | 'Publishing'
  | 'VersionSelection'
  | 'PageView'
  | 'Transformations'
  | 'Discard'
  | 'SelectDM';

const TRACKING_TOKENS_MAP: { [key in TRACKING_TOKENS]: string } = {
  UIEditor: 'UI Editor used',
  BreakingChanges: 'Applied breaking changes',
  CodeEditor: 'Code Editor used',
  Publishing: 'Publishing data model',
  VersionSelection: 'Version selection',
  PageView: 'Page view',
  Transformations: 'Created transformation via platypus',
  Discard: 'Discarded data model',
  SelectDM: 'Selected data model',
};
mixpanel.init(config.MIXPANEL_TOKEN);

export const useMixpanel = () => {
  const { data: user } = useQuery('authenticatedUser', getUserInformation, {
    staleTime: Infinity,
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
  });
  return useMemo(
    () => ({
      track: async (eventName: TRACKING_TOKENS, properties?: Dict) => {
        if (process.env.NODE_ENV !== 'production') {
          return;
        }
        mixpanel.identify(user?.id);
        mixpanel.track(TRACKING_TOKENS_MAP[eventName], {
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
  const { path, params, url } = useRouteMatch();
  useEffect(() => {
    track('PageView', {
      path,
      url,
      ...Object.entries(params).reduce(
        (prev, [key, value]) => ({
          ...prev,
          [`params-${key}`]: value as string,
        }),
        {} as { [key in string]: string }
      ),
    });
  }, [path, params, url, track]);
};
