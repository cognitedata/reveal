import React, { useEffect } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { useLocation, useHistory } from 'react-router';
import { createLink } from '@cognite/cdf-utilities';
import { AssetPreview, AssetPreviewTabType } from 'lib/containers/Assets';

export const AssetPage = () => {
  const { assetId } = useParams<{
    assetId: string;
  }>();
  const assetIdNumber = parseInt(assetId, 10);

  useEffect(() => {
    trackUsage('Exploration.Asset', { assetId: assetIdNumber });
  }, [assetIdNumber]);

  const match = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as AssetPreviewTabType;

  return (
    <AssetPreview
      assetId={assetIdNumber}
      tab={activeTab}
      onTabChange={tab =>
        history.push(
          createLink(`${match.url.substr(match.url.indexOf('/', 1))}/${tab}`)
        )
      }
    />
  );
};
