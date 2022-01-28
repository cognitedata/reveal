import { Icon } from '@cognite/cogs.js';

import { BoundingBoxGraphic } from './BoundingBoxGraphic';
import * as Styled from './style';

type NewDataSourceProps = {
  isActive: boolean;
};

export const NewDataSource = ({ isActive }: NewDataSourceProps) => {
  return (
    <Styled.Collapse
      expandIcon={expandIcon}
      defaultActiveKey={isActive ? 'new' : undefined}
    >
      <Styled.Panel
        key="new"
        header={
          <Styled.Header className="cogs-body-3 strong">
            Add new data source
          </Styled.Header>
        }
      >
        <Styled.InfoBox>
          <Styled.InfoBoxInnerContent>
            <BoundingBoxGraphic width="66" />
            <div className="cogs-body-2 strong">
              Create a bounding box on text area
            </div>
            <div className="cogs-micro">Tag details will show here</div>
          </Styled.InfoBoxInnerContent>
        </Styled.InfoBox>
      </Styled.Panel>
    </Styled.Collapse>
  );
};

const expandIcon = () => {
  return (
    <Icon
      type="AddLarge"
      style={{
        marginRight: '8px',
        flexShrink: 0,
      }}
    />
  );
};
