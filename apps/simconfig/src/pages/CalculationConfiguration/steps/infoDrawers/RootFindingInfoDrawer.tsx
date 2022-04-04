import { InfoDrawer } from 'components/shared/InfoDrawer';

export function RootFindingInfoDrawer() {
  return (
    <InfoDrawer title="Root finding">
      <dl>
        <dt>Main Solution</dt>
        <dd>
          Defines which solution should be saved as data points, if multiple
          solutions are found.
        </dd>
        <dt>Tolerance</dt>
        <dd>The solution tolerance for the root-finding algorithm.</dd>
        <dt>Lower and Upper Bound</dt>
        <dd>
          Specifies the region where the solver should look for a gas rate
          solution.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
