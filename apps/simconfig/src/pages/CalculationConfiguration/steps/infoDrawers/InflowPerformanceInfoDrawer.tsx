import { InfoDrawer } from 'components/shared/InfoDrawer';

export function InflowPerformanceInfoDrawer() {
  return (
    <InfoDrawer title="Inflow Performance calculation">
      <dl>
        <dd>
          The Inflow Performance calculation estimates the flow rates of well
          fluids (gas, oil, water, and liquid) using the inflow performance
          curve (also known as IPR curve). PROSPER does not expose an explicit
          calculation command for this method, so an iterative numeric nonlinear
          solving routine is performed on top of PROSPER to enable the
          calculation. There are 3 input variables required for the Inflow
          Performance calculation: BHP, CGR/GOR, and WGR/WC.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
