import * as Styled from './style';

export type DataElementsSkeletonProps = {
  length?: number;
};

export const DataElementListSkeleton = ({
  length = 5,
}: DataElementsSkeletonProps) => {
  const keys = Array.from(Array(length).keys());

  return (
    <>
      {keys.map((key) => (
        <Styled.DataElementSkeleton key={key} height="56px" width="100%" />
      ))}
    </>
  );
};
