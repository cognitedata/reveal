import { InfoDrawer } from 'components/shared/InfoDrawer';

export function BHPEstimationInfoDrawer() {
  return (
    <InfoDrawer title="BHP estimation">
      <dl>
        <dd>
          If a sandface Bottom Hole Pressure sensor is not available, it can be
          estimated using one of the available BHP estimation methods. The
          default setting for this sensor is Disabled.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
