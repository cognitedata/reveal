import { createLink } from '@cognite/cdf-utilities';
import { Button, Tooltip } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';
import { EXPLORATION } from 'app/constants/metrics';
import { useCurrentResourceId, useQueryString } from 'app/hooks/hooks';
import { FILTER } from 'app/store/filter/constants';
import { SEARCH_KEY } from 'app/utils/constants';
import { trackUsage } from 'app/utils/Metrics';
import { useLocation, useNavigate } from 'react-router-dom';

export const PreviewCloseButton: React.FC<{ item: ResourceItem }> = ({
  item,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = location.pathname.includes('/search');

  const [, openPreview] = useCurrentResourceId();
  const [query] = useQueryString(SEARCH_KEY);
  const [filter] = useQueryString(FILTER);

  const handlePreviewClose = () => {
    openPreview(undefined);
    trackUsage(EXPLORATION.CLICK.CLOSE_DETAILED_VIEW, item);
  };

  const handleFullPagePreviewClose = () => {
    navigate(
      createLink(`/explore/search/${item.type}`, {
        [SEARCH_KEY]: query,
        [FILTER]: filter,
      }),
      { replace: true }
    );

    // Note: keeping the old code as comment, as it might be useful in the near future!

    // if (!location.state?.history || location.state?.history?.length === 0) {

    // }

    // navigate(
    //   location.state.history[location.state.history.length - 1].path +
    //     location.search,
    //   {
    //     state: {
    //       history:
    //         isArray(location.state?.history) &&
    //         location.state.history.slice(0, -1),
    //     },
    //   }
    // );
    trackUsage(EXPLORATION.CLICK.CLOSE_FULL_PAGE, item);
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
            handleFullPagePreviewClose();
          }
        }}
      />
    </Tooltip>
  );
};
