import { Icon } from '@cognite/cogs.js';
import { SecondaryTopbar, createLink } from '@cognite/cdf-utilities';
import { useEMPipeline } from 'hooks/entity-matching-pipelines';
import { useParams } from 'react-router-dom';

type Props = { id: number };
export default function Pipeline({ id }: Props) {
  const { data, isInitialLoading } = useEMPipeline(id);
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }

  return (
    <>
      <SecondaryTopbar
        title={data?.name || ''}
        goBackFallback={createLink(`/${subAppPath}`)}
      />
      <pre>{JSON.stringify(data || {}, null, 4)}</pre>
    </>
  );
}
