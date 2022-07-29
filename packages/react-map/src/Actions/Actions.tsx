import { ActionContainer } from './elements';
import { ActionStatus } from './Status';
import { ActionWrapper } from './Wrapper';
import { LayersButton } from './Layers';
import { LineButton } from './Line';
import { PolygonButton } from './Polygon';

const Actions: any = {
  Wrapper: ActionWrapper,
  LayersButton: (props: React.ComponentProps<typeof LayersButton>) => {
    return (
      <ActionContainer>
        <LayersButton {...props} />
      </ActionContainer>
    );
  },
  Line: LineButton,
  Status: ActionStatus,
  Polygon: (props: React.ComponentProps<typeof PolygonButton>) => {
    return (
      <ActionContainer>
        <PolygonButton {...props} />
      </ActionContainer>
    );
  },
};

export { Actions };
