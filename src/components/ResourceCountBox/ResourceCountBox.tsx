import {
  ValueTag,
  EmptyBorderedBox,
  EmptyValueTag,
  BorderedBox,
} from 'utils/styledComponents';
import Col from 'antd/lib/col';
import Tooltip from 'antd/lib/tooltip';
import { abbreviateNumber, getContainer } from 'utils/shared';
import { Icons } from '@cognite/cogs.js';
import { ExploreViewConfig } from 'utils/types';
import { useTranslation } from 'common/i18n';

interface ResourceCountBoxProps {
  count: number;
  resourceName: string;
  setExploreView?(value: ExploreViewConfig): void;
  dataSetId?: number;
}

const ResourceCountBox = ({
  count,
  resourceName,
  setExploreView,
  dataSetId,
}: ResourceCountBoxProps) => {
  const { t } = useTranslation();
  const handleOnClick = () => {
    if (resourceName === 'Events' && setExploreView && dataSetId) {
      setExploreView({
        visible: true,
        type: 'events-profile',
        id: dataSetId,
      });
    }
  };
  const isEvents = () => resourceName === 'Events';
  return (
    <Col xs={24} sm={16} md={12} lg={6} xl={6} xxl={6}>
      {count > 0 && (
        <Tooltip
          title={isEvents() && <p>{t('view-events-profile')}</p>}
          getPopupContainer={getContainer}
        >
          <BorderedBox
            onClick={handleOnClick}
            className={isEvents() ? 'clickableBox' : undefined}
          >
            {resourceName}
            <ValueTag>
              <Tooltip
                title={<div>{count}</div>}
                getPopupContainer={getContainer}
              >
                {abbreviateNumber(count)}
              </Tooltip>
            </ValueTag>
            {isEvents() && <Icons.Expand />}
          </BorderedBox>
        </Tooltip>
      )}
      {count === 0 && (
        <EmptyBorderedBox>
          {resourceName}
          <EmptyValueTag>{count}</EmptyValueTag>
        </EmptyBorderedBox>
      )}
      {count === -1 && (
        <Tooltip
          title={
            <p>
              {t('resource-count-p1-1', { resourceName })}
              <b>{resourceName.toLocaleLowerCase()}:read</b>{' '}
              {t('resource-count-p1-2')}
              <br />
              <b style={{ fontStyle: 'italic' }}>{t('resource-count-p2')}</b>
            </p>
          }
          getPopupContainer={getContainer}
        >
          <EmptyBorderedBox>
            {resourceName}
            <EmptyValueTag>-</EmptyValueTag>
          </EmptyBorderedBox>
        </Tooltip>
      )}
    </Col>
  );
};

export default ResourceCountBox;
