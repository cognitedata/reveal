import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { Dict } from 'mixpanel-browser';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { getCluster, getProject } from '@cognite/cdf-utilities';

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
  | 'DataModel.ImportTypes'
  | 'DataModel.ImportTypesCopied'
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
  // filters
  | 'FilterBuilder.Apply'
  | 'FilterBuilder.Open'
  | 'FilterBuilder.Copy'
  // graph
  | 'Graph.Expand'
  | 'Graph.Filter'
  | 'Graph.Open'
  // columns
  | 'ColumnSelection.Select'
  | 'ColumnSelection.Reorder'
  | 'ColumnSelection.SelectAll'
  | 'ColumnSelection.Open'
  // extra path tracking
  | 'UIEditor'
  | 'ChatGPTSearch.GeneratedQuery'
  | 'ChatGPTSearch.RunQuery'
  | 'ChatGPTSearch.Failed'
  | 'Navigate';

const track = async (eventName: TRACKING_TOKENS, properties?: Dict) => {
  return trackEvent(eventName, {
    cluster: getCluster(),
    project: getProject(),
    ...properties,
  });
};
export const useMixpanel = () => ({
  track,
});

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
