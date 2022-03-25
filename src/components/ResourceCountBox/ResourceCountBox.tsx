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
          title={isEvents() && <p>View events profile</p>}
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
              Count is not available. This may be due to insufficient acces
              rights, to view the counts for {resourceName} you need{' '}
              <b>{resourceName.toLocaleLowerCase()}:read</b> capability.
              <br />
              <b style={{ fontStyle: 'italic' }}>
                If your dataset is new, it may also be empty
              </b>
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
