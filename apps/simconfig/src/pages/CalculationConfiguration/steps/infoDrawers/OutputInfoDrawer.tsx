import { InfoDrawer } from 'components/shared/InfoDrawer';

export function OutputInfoDrawer() {
  return (
    <InfoDrawer title="Output configuration">
      <dl>
        <dt>Time Series</dt>
        <dd>Defines the time series for data output.</dd>
        <dt>Unit</dt>
        <dd>Defines the desired unit of measurement.</dd>
      </dl>
    </InfoDrawer>
  );
}
