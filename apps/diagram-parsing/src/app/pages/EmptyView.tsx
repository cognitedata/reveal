import { EmptyState, Flex, IllustrationType } from '@cognite/cogs.js';

type EmptyViewProps = {
  body: string;
  illustration: IllustrationType;
  title: string;
};

export const EmptyView = ({ body, illustration, title }: EmptyViewProps) => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ width: '100vw', height: '70vh' }}
    >
      <EmptyState illustration={illustration} title={title} body={body} />
    </Flex>
  );
};
