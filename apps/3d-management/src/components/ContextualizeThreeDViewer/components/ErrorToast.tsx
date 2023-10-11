import { Flex } from '@cognite/cogs.js';

export default function ErrorToast({
  error,
}: {
  error: Error;
  title?: string;
}) {
  return (
    <Flex direction="column" gap={10}>
      <p>{error?.message}</p>
    </Flex>
  );
}
