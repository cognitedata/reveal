import { useConventionListQuery } from '../service/hooks/query/useConventionListQuery';

export const useDependentConvention = () => {
  const { data: conventions } = useConventionListQuery();

  return (id: string | undefined) => {
    return id ? conventions?.find((item) => item.id === id) : undefined;
  };
};
