import * as S from './elements';

export type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className }: SkeletonProps) => (
  <S.Skeleton className={className} />
);
