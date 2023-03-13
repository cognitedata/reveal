import ResourceTypei18n from 'components/resource-type-i18n';

import { useAggregate } from 'hooks/aggregates';
import { Filter, SourceType, TargetType } from 'types/api';

type Props = {
  type: SourceType | TargetType;
  filter?: Filter;
  advancedFilter?: any;
};
const NumberFormat = new Intl.NumberFormat(undefined);
export default function ResourceCount({ type, filter, advancedFilter }: Props) {
  const { data } = useAggregate({ type, filter, advancedFilter });
  const count = data?.[0].count;

  return Number.isFinite(count) ? (
    <>
      {NumberFormat.format(count as number)}{' '}
      <ResourceTypei18n t={type} count={count} downcase />
    </>
  ) : null;
}
