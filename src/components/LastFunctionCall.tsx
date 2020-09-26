import { useQuery } from 'react-query';
import { Call } from 'types';
import { getCalls } from 'utils/api';

type Props = {
  id: number;
  renderLoading?: () => JSX.Element | null;
  renderMissing?: () => JSX.Element | null;
  renderCall: (id: number, call: Call) => JSX.Element | null;
};
export default function LastFunctionCall({
  id,
  renderCall,
  renderLoading,
  renderMissing,
}: Props) {
  const { data: calls, isFetched } = useQuery<Call[]>(
    ['/functions/calls', { id }],
    getCalls
  );

  if (!isFetched) {
    return renderLoading ? renderLoading() : null;
  }

  const call = calls?.[0];
  if (call) {
    return renderCall(id, call);
  }
  return renderMissing ? renderMissing() : null;
}
