import { TransformationRead } from '@transformations/types';

import { getActionTypeDisplayName, getDestinationDisplayName } from './utils';

type Props = {
  destination: TransformationRead['destination'];
  conflictMode: TransformationRead['conflictMode'];
};
export default function TargetDescription({
  destination,
  conflictMode,
}: Props) {
  const destinationTypeDisplayName = getDestinationDisplayName(destination);

  return (
    <div>
      {getActionTypeDisplayName(conflictMode)} {destinationTypeDisplayName}
    </div>
  );
}
