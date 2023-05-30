import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Tooltip } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { FilePreviewTabType } from '@data-exploration-app/containers/File/FilePreview';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';

export const FullscreenButton: React.FC<{ item: ResourceItem }> = ({
  item,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = location.pathname.includes('/search');

  const { tabType } = useParams<{
    tabType: FilePreviewTabType;
  }>();

  const search = getSearchParams(location.search);

  const goToPreview = () => {
    navigate(
      createLink(
        `/explore/search/${item.type}/${item.id}${
          tabType ? `/${tabType}` : ''
        }`,
        search
      ),
      {
        state: {
          history: location.state?.history,
        },
      }
    );
    trackUsage(EXPLORATION.CLICK.COLLAPSE_FULL_PAGE, item);
  };

  const goToFullPagePreview = () => {
    navigate(
      createLink(
        `/explore/${item.type}/${item.id}${tabType ? `/${tabType}` : ''}`,
        search
      ),
      {
        state: {
          history: location.state?.history,
        },
      }
    );
    trackUsage(EXPLORATION.CLICK.EXPAND_FULL_PAGE, item);
  };

  if (!isPreview) return null;

  return (
    <Tooltip content={isPreview ? 'Open in fullscreen' : 'Close fullscreen'}>
      <Button
        icon={isPreview ? 'Expand' : 'Collapse'}
        aria-label="Toggle fullscreen"
        onClick={() => {
          if (isPreview) {
            goToFullPagePreview();
          } else {
            goToPreview();
          }
        }}
      />
    </Tooltip>
  );
};
