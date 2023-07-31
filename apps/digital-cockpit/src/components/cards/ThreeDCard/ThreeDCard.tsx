import ThreeDPreview from 'components/explorer/ThreeDPreview';

import Card from '../Card';

export type ThreeDCardProps = {
  assetId: number;
};

const ThreeDCard = ({ assetId }: ThreeDCardProps) => {
  return (
    <Card header={{ title: '3D', icon: 'Cube' }}>
      <ThreeDPreview assetId={assetId} applyGeometryFilter />
    </Card>
  );
};

export default ThreeDCard;
