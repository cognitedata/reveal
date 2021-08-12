import { DetailButton } from 'pages/DataTransfers/elements';
import { DataTransfersTableData } from 'pages/DataTransfers/types';
import { FC } from 'react';

interface Props {
  record: DataTransfersTableData;
  onClick: (record: DataTransfersTableData) => void;
}
export const DetailViewButton: FC<Props> = ({ record, onClick }) => {
  const { revisions = [] } = record?.source || {};

  if (revisions.length === 0) {
    return null;
  }

  return (
    <DetailButton
      onClick={() => {
        onClick(record);
      }}
    >
      View
    </DetailButton>
  );
};
