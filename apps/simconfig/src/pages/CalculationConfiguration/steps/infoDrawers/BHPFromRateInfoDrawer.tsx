import { InfoDrawer } from 'components/shared/InfoDrawer';

export function BHPFromRateInfoDrawer() {
  return (
    <InfoDrawer title="BHP from Rate calculation">
      <dl>
        <dd>
          The BHP from Rate calculation estimates the Bottom Hole Pressure using
          the Tubing Performance Curve (also known as VLP curve or lift curve).
          There are 5 input variables required for the BHP from Rate: Gas/Oil
          rate, THP, THT, CGR/GOR, and WGR/WC.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
