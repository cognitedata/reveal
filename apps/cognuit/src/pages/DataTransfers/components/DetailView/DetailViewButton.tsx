import { DetailButton } from 'pages/DataTransfers/elements';
import { DataTransfersTableData } from 'pages/DataTransfers/types';
import { FC } from 'react';

interface Props {
  record: DataTransfersTableData;
  onDetailViewClick: (record: DataTransfersTableData) => void;
}
export const DetailViewButton: FC<Props> = ({ record, onDetailViewClick }) => {
  const { revisions } = record;

  if (revisions.length === 0) {
    return null;
  }

  return (
    <>
      <DetailButton
        onClick={() => {
          onDetailViewClick(record);
        }}
      >
        Detail view
      </DetailButton>
    </>
  );
};
