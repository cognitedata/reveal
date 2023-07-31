import { InfoDrawer } from 'components/shared/InfoDrawer';

export function ChokeCurveInfoDrawer() {
  return (
    <InfoDrawer title="Choke Performance">
      <dl>
        <dd>
          The choke curve represents the relationship between the choke valve
          opening and the choke valve setting. The choke curve is used to
          convert the measured valve opening to the associated choke setting.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
