import { Body, Flex, Title } from '@cognite/cogs.js';

export const ErrorPlaceholder = () => {
  return (
    <div style={{ position: 'relative', display: 'block', paddingTop: '50px' }}>
      <Flex
        alignItems="center"
        justifyContent="center"
        style={{ flex: 1 }}
        direction="column"
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
          Unable to parse schema.
        </Title>
        <Body>Please check your schema or learn how to create one?</Body>
      </Flex>
    </div>
  );
};
