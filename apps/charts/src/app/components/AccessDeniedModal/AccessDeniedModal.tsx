import { useTranslations } from '@charts-app/hooks/translations';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { Flex, Button, Body } from '@cognite/cogs.js';

import { StyledModal, StyledUl, ModalHeader } from './elements';

type Props = {
  capabilities: string[];
  visible: boolean;
  onOk: () => void;
};

const defaultTranslations = makeDefaultTranslations(
  'Contact your CDF administrator to request the following capabilities:',
  'Capabilities Required'
);

export const AccessDeniedModal = ({ capabilities, visible, onOk }: Props) => {
  const { t } = useTranslations(
    Object.keys(defaultTranslations),
    'AccessDeniedModal'
  );
  return (
    <StyledModal
      visible={visible}
      title={<ModalHeader title={t['Capabilities Required']} />}
      width={600}
      onCancel={onOk}
      footer={
        <Flex justifyContent="end">
          <Button type="primary" onClick={onOk}>
            Close
          </Button>
        </Flex>
      }
    >
      <Flex direction="column">
        <Body level={2}>
          {
            t[
              'Contact your CDF administrator to request the following capabilities:'
            ]
          }
        </Body>
        <StyledUl>
          {capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </StyledUl>
      </Flex>
    </StyledModal>
  );
};
