import { InfoDrawer } from 'components/shared/InfoDrawer';

export function NodalAnalysisInfoDrawer() {
  return (
    <InfoDrawer title="Nodal Analysis calculation">
      <dl>
        <dd>
          The Nodal Analysis calculates the flow rates of well fluids (gas, oil,
          water, and liquid) and the Bottom Hole Pressure by solving the PROSPER
          System Analysis routine. This is the complete well model calculation
          used to determine well potentials and any analysis sensitivities.
          There are 3 input variables required for the Nodal Analysis: THP,
          WGR/WC, and CGR/GOR.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
