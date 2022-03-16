import { InfoDrawer } from 'components/shared/InfoDrawer';

export function LiftCurveSolutionInfoDrawer() {
  return (
    <InfoDrawer title="Lift Curve Solution calculation">
      <dl>
        <dd>
          The Lift Curve Solution calculation estimates the flow rates of well
          fluids (gas, oil, water, and liquid) using the tubing performance
          curve (also known as VLP curve or lift curve). PROSPER does not expose
          an explicit calculation command for this method, so an iterative
          numeric nonlinear solving routine is performed on top of PROSPER to
          enable the calculation. There are 5 input variables required for the
          Lift Curve Solution: BHP, THP, THT, CGR/GOR, and WGR/WC.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
