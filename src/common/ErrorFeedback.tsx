import { Infobox } from '@cognite/cogs.js';

export default function ErrorFeedback({ error }: { error: Error }) {
  return (
    <Infobox type="danger" title="ERROR!!!11">
      <h1>Error</h1>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </Infobox>
  );
}
