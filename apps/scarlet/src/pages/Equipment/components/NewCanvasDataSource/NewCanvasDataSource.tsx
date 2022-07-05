import { Icon } from '@cognite/cogs.js';

import { BoundingBoxGraphic } from './BoundingBoxGraphic';
import * as Styled from './style';

export const NewCanvasDataSource = () => (
  <Styled.Container>
    <Styled.Header className="cogs-body-3 strong">
      <Icon type="AddLarge" />
      Add new data source from canvas
    </Styled.Header>
    <Styled.Body>
      <Styled.ContentContainer>
        <Styled.Content>
          <BoundingBoxGraphic width="66" />
          <div className="cogs-body-2 strong">
            Create a bounding box on text area
          </div>
          <div className="cogs-micro">Tag details will show here</div>
        </Styled.Content>
      </Styled.ContentContainer>
    </Styled.Body>
  </Styled.Container>
);
