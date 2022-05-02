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
          Unable to load the preview.
        </Title>
        <Body>
          Something went wrong and we were notified about it. If you want you
          can or contact the team{' '}
          <a href="mailto:devx@cognite.com">devx@cognite.com</a>
        </Body>
      </Flex>
    </div>
  );
};
