import { InfoDrawer } from 'components/shared/InfoDrawer';

export function GradientTraverseGaugeDepthInfoDrawer() {
  return (
    <InfoDrawer title="Gradient Traverse Gauge Depth">
      <dl>
        <dd>
          The gauge depth specifies the measured depth of the gauge Bottom Hole
          Pressure sensor used as input for this calculation.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
