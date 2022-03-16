import { InfoDrawer } from 'components/shared/InfoDrawer';

export function BHPFromBHPgInfoDrawer() {
  return (
    <InfoDrawer title="BHP from BHPg">
      <dl>
        <dd>
          The BHP from BHPg calculation estimates the Bottom Hole Pressure using
          the Tubing Performance Curve (also known as VLP curve or lift curve).
          PROSPER does not expose an explicit calculation command for this
          method, so an iterative numeric nonlinear solving routine is performed
          on top of PROSPER to enable the calculation. There are 5 input
          variables required for the BHP from BHPg: BHPg, THP, THT, CGR/GOR, and
          WGR/WC.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
