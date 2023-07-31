import { ActionContainer } from './elements';
import { ActionStatus } from './Status';
import { AddActionWrapper } from './Wrapper';
import { LayersButton } from './Layers';
import { LineButton } from './Line';
import { PolygonAction } from './Polygon';

const Actions = {
  Wrapper: AddActionWrapper,
  LayersButton: (props: React.ComponentProps<typeof LayersButton>) => {
    return (
      <ActionContainer>
        <LayersButton {...props} />
      </ActionContainer>
    );
  },
  Line: LineButton,
  Status: ActionStatus,
  Polygon: (props: React.ComponentProps<typeof PolygonAction>) => {
    return (
      <ActionContainer>
        <PolygonAction {...props} />
      </ActionContainer>
    );
  },
};

export { Actions };
