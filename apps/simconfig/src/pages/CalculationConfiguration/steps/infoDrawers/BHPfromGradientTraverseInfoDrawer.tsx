import { InfoDrawer } from 'components/shared/InfoDrawer';

export function BHPfromGradientTraverseInfoDrawer() {
  return (
    <InfoDrawer title="BHP from Gradient Traverse calculation">
      <dl>
        <dd>
          The BHP from the gradient traverse calculation estimates the Bottom
          Hole Pressure using the gradient traverse curve. There are 2 input
          variables required for the BHP from the gradient traverse: BHPg and
          Gauge Depth.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
