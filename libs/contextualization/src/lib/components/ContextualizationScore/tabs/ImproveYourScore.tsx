import { Button } from '@cognite/cogs.js';

import { useGetAdvancedJoinsURL } from '../../../utils';

export const ImproveYourScore = ({
  headerName,
  dataModelType,
}: {
  headerName: string;
  dataModelType: string;
}) => {
  const AdvancedJoinsURL = useGetAdvancedJoinsURL(headerName, dataModelType);

  return (
    <Button
      style={{
        width: '100%',
      }}
      type="primary"
      onClick={() => {
        window.location.href = AdvancedJoinsURL;
      }}
    >
      Improve your score
    </Button>
  );
};
