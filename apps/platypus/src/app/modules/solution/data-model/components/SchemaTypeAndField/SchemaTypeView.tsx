import { Button, Flex, Title } from '@cognite/cogs.js';
import { DataModelTypeDefsType } from '@platypus/platypus-core';

type SchemaTypeViewProps = {
  currentType: DataModelTypeDefsType;
  onNavigateBack: () => void;
  children?: React.ReactNode;
};

export const SchemaTypeView = ({
  currentType,
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
        <Title level="5">{currentType.name}</Title>
      </Flex>
      <div style={{ marginTop: '10px' }}>{children}</div>
    </div>
  );
};
