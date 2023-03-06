import ResourceTypei18n from 'components/resource-type-i18n';
import { Filter, SourceType, TargetType } from 'context/QuickMatchContext';
import { useAggregate } from 'hooks/aggregates';

type Props = {
  type: SourceType | TargetType;
  filter: Filter;
  advancedFilter?: any;
};
const NumberFormat = new Intl.NumberFormat(undefined);
export default function ResourceCount({ type, filter, advancedFilter }: Props) {
  const { data } = useAggregate({ type, filter, advancedFilter });

  const n = data && Number.isFinite(data) && NumberFormat.format(data);

  return Number.isFinite(data) ? (
    <>
      {n} <ResourceTypei18n t={type} count={data} downcase />
    </>
  ) : null;
}
