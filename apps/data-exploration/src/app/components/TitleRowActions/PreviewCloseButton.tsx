import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { FilePreviewTabType } from '@data-exploration-app/containers/File/FilePreview';
import { useCurrentResourceId } from '@data-exploration-app/hooks/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Tooltip } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';

export const PreviewCloseButton: React.FC<{ item: ResourceItem }> = ({
  item,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = location.pathname.includes('/search');

  const [, openPreview] = useCurrentResourceId();
  const { tabType } = useParams<{
    tabType: FilePreviewTabType;
  }>();

  const handlePreviewClose = () => {
    openPreview(undefined);
    trackUsage(EXPLORATION.CLICK.CLOSE_DETAILED_VIEW, item);
  };

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

  return (
    <Tooltip content="Close preview">
      <Button
        icon="Close"
        aria-label="Close"
        onClick={() => {
          if (isPreview) {
            handlePreviewClose();
          } else {
            goToPreview();
          }
        }}
      />
    </Tooltip>
  );
};
