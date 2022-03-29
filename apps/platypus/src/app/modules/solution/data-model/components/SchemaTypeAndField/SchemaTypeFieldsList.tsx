import { Body, Flex } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

type SchemaTypeFieldsListProps = {
  children?: React.ReactNode;
};

export function SchemaTypeFieldsList({ children }: SchemaTypeFieldsListProps) {
  const { t } = useTranslation('SchemaTypeFieldsList');

  return (
    <Flex direction="column" gap={8}>
      <Flex
        justifyContent="space-between"
        style={{ flex: 'auto', paddingLeft: 16, paddingRight: 10 }}
      >
        <Flex gap={8} style={{ flex: '100%', marginTop: 16 }}>
          <Body level="2" style={{ flex: '100%' }}>
            {t('field_name_label', 'Field name')}
          </Body>
          <Body level="2" style={{ flex: '100%' }}>
            {t('field_type_label', 'Type')}
          </Body>
        </Flex>
        <Flex>
          <Body level="2" style={{ marginTop: 16 }}>
            {t('field_label_req', 'Req.')}
          </Body>
          <span style={{ width: 36 }} />
        </Flex>
      </Flex>

      {children}
    </Flex>
  );
}
