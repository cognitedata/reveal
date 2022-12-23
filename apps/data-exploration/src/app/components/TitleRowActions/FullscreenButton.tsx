import { createLink } from '@cognite/cdf-utilities';
import { Button, Tooltip } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { FilePreviewTabType } from '@data-exploration-app/containers/File/FilePreview';
import { useQueryString } from '@data-exploration-app/hooks/hooks';
import { FILTER } from '@data-exploration-app/store/filter/constants';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const FullscreenButton: React.FC<{ item: ResourceItem }> = ({
  item,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = location.pathname.includes('/search');

  const [query] = useQueryString(SEARCH_KEY);
  const [filter] = useQueryString(FILTER);
  const { tabType } = useParams<{
    tabType: FilePreviewTabType;
  }>();

  const goToPreview = () => {
    navigate(
      createLink(
        `/explore/search/${item.type}/${item.id}${
          tabType ? `/${tabType}` : ''
        }`,
        {
          [SEARCH_KEY]: query,
          ...(filter && { [FILTER]: filter }),
        }
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
        {
          [SEARCH_KEY]: query,
          ...(filter && { [FILTER]: filter }),
        }
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
