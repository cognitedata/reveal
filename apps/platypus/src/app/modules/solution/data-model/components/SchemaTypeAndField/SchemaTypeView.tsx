import { DataModelTypeDefsType } from '@fusion/data-modeling';

import { Button, Chip, Flex, Title } from '@cognite/cogs.js';

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
      <Flex justifyContent="space-between">
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
          <Chip size="x-small" label={currentType.kind} />
        </Flex>
        <Flex alignItems="center" gap={4} style={{ marginRight: '10px' }}>
          {currentType.directives?.map((directive) => (
            <Chip size="x-small" type="neutral" label={directive.name} />
          ))}
        </Flex>
      </Flex>
      <div style={{ marginTop: '10px' }}>{children}</div>
    </div>
  );
};
