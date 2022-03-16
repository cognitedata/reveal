import { InfoDrawer } from 'components/shared/InfoDrawer';

export function ChokePerformanceInfoDrawer() {
  return (
    <InfoDrawer title="Choke Performance calculation">
      <dl>
        <dd>
          The Choke Performance calculation estimates the flow rates of well
          fluids (gas, oil, water, and liquid) by solving PROSPER Choke
          Performance calculation. There are 6 input variables required for the
          Well Model using Choke Performance: THP, THT, Flowline Pressure, Choke
          Opening, CGR/GOR, and WGR/WC.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
