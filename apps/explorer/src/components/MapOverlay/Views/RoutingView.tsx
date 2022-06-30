import { Button } from '@cognite/cogs.js';

interface Props {
  name: string;
}

// WIP
export const RoutingView: React.FC<Props> = ({ name }) => {
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Button icon="ArrowLeft" />
        <div> My desk </div>
        <div> {name}</div>
      </div>
    </div>
  );
};
