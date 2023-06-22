import { Button, Flex, Textarea } from '@cognite/cogs.js';

export const WaitComponent = () => (
  <Flex style={{ position: 'relative', width: '100%' }}>
    <Textarea
      placeholder="Ask CogPilot anything..."
      style={{
        height: 100,
        width: '100%',
        margin: 0,
      }}
      disabled
    />
    <Flex>
      <Button style={{ opacity: 0 }} disabled size="small" />
    </Flex>
  </Flex>
);
