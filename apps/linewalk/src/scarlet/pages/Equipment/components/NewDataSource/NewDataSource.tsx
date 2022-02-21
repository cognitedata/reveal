import { Icon } from '@cognite/cogs.js';
import { useDataPanelContext } from 'scarlet/hooks';
import { DataPanelActionType } from 'scarlet/types';

import { BoundingBoxGraphic } from './BoundingBoxGraphic';
import * as Styled from './style';

export const NewDataSource = () => {
  const { dataPanelState, dataPanelDispatch } = useDataPanelContext();

  return (
    <Styled.Collapse
      expandIcon={expandIcon}
      activeKey={dataPanelState.isActiveNewDataSource ? 'new' : undefined}
      onChange={(value) => {
        dataPanelDispatch({
          type: DataPanelActionType.TOGGLE_NEW_DATA_SOURCE,
          isActive: Boolean(value),
        });
      }}
      accordion
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
      aria-label="Toggle new data source"
      style={{
        marginRight: '8px',
        flexShrink: 0,
      }}
    />
  );
};
