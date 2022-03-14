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
        style={{ flex: 'auto', paddingLeft: 10, paddingRight: 10 }}
      >
        <Flex gap={8} style={{ flex: '100%', marginTop: 8 }}>
          <Body level="2" style={{ flex: '100%', color: '#595959' }}>
            {t('field_name_label', 'Field name')}
          </Body>
          <Body level="2" style={{ flex: '100%', color: '#595959' }}>
            {t('field_type_label', 'Type')}
          </Body>
        </Flex>
        <Flex>
          <Body level="2" style={{ color: '#595959' }}>
            {t('field_label_req', 'Req.')}
          </Body>
          <span style={{ width: 36 }} />
        </Flex>
      </Flex>

      {children}
    </Flex>
  );
}
