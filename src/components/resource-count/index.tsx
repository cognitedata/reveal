import ResourceTypei18n from 'components/resource-type-i18n';
import { Filter, SourceType, TargetType } from 'context/QuickMatchContext';
import { useAggregate } from 'hooks/aggregates';

type Props = {
  type: SourceType | TargetType;
  filter: Filter;
  advancedFilter?: any;
};
export default function ResourceCount({ type, filter, advancedFilter }: Props) {
  const { data } = useAggregate({ type, filter, advancedFilter });
  return Number.isFinite(data) ? (
    <>
      {data} <ResourceTypei18n t={type} count={data} downcase />
    </>
  ) : null;
}
