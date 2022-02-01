import * as Styled from './style';

export type DataElementsSkeletonProps = {
  amount?: number;
};

export const DataElementListSkeleton = ({
  amount = 5,
}: DataElementsSkeletonProps) => {
  const keys = Array.from(Array(amount).keys());

  return (
    <>
      {keys.map((key) => (
        <Styled.DataElementSkeleton key={key} height="56px" width="100%" />
      ))}
    </>
  );
};
