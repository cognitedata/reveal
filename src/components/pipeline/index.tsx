import { Icon } from '@cognite/cogs.js';
import { SecondaryTopbar } from '@cognite/cdf-utilities';
import { useEMPipeline } from 'hooks/entity-matching-pipelines';

type Props = { id: number };
export default function Pipeline({ id }: Props) {
  const { data, isInitialLoading } = useEMPipeline(id);

  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }

  return (
    <>
      <SecondaryTopbar title={data?.name || ''} />
      <pre>{JSON.stringify(data || {}, null, 4)}</pre>
    </>
  );
}
