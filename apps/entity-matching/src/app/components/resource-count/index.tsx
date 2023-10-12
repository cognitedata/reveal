import { useAggregate } from '../../hooks/aggregates';
import { API, Filter } from '../../types/api';
import ResourceTypei18n from '../resource-type-i18n';

type Props = {
  type: Exclude<API, 'threeD'>;
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
