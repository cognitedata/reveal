import { Button, Flex, Title } from '@cognite/cogs.js';

type SchemaTypeViewProps = {
  currentTypeName: string;
  onNavigateBack: () => void;
  children?: React.ReactNode;
};

export const SchemaTypeView = ({
  currentTypeName,
  onNavigateBack,
  children,
}: SchemaTypeViewProps) => {
  return (
    <div style={{ marginTop: 16 }}>
      <Flex alignItems="center" gap={4}>
        <Button
          icon="ArrowLeft"
          type="ghost"
          data-cy="type-view-back-button"
          aria-label="Return to list"
          style={{ marginLeft: 6 }}
          onClick={() => onNavigateBack()}
        />
        <Title level="5">{currentTypeName}</Title>
      </Flex>
      <div style={{ marginTop: '10px' }}>{children}</div>
    </div>
  );
};
