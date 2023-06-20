import styled from 'styled-components';

import {
  Body,
  Chip,
  ChipProps,
  Colors,
  Flex,
  Icon,
  IconType,
} from '@cognite/cogs.js';

type FormFieldSelectOptionProps = {
  chipProps?: {
    label: string;
    icon?: IconType;
    type?: ChipProps['type'];
  };
  description?: string;
  icon?: IconType;
  label: string;
};

const FormFieldSelectOption = ({
  chipProps,
  description,
  icon,
  label,
}: FormFieldSelectOptionProps): JSX.Element => {
  return (
    <StyledContainer>
      <Flex alignItems="center" gap={8}>
        {icon && <Icon type={icon} />}
        <Flex gap={4}>
          <Body level={2}>{label}</Body>
          {description && (
            <StyledDescription level={2}>({description})</StyledDescription>
          )}
        </Flex>
      </Flex>
      {chipProps && (
        <Chip
          icon={chipProps.icon}
          size="x-small"
          type={chipProps.type}
          label={chipProps.label}
        />
      )}
    </StyledContainer>
  );
};

const StyledContainer = styled(Flex).attrs({
  alignItems: 'center',
  gap: 8,
  justifyContent: 'space-between',
})`
  color: ${Colors['text-icon--strong']};
  height: 100%;
`;

const StyledDescription = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

export default FormFieldSelectOption;
