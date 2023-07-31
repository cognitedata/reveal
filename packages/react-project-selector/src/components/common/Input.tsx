import React from 'react';
import styled from 'styled-components';
import { Icon, Input as InputEl } from '@cognite/cogs.js';

import { Box, Text, Flex } from './index';

interface InputProps {
  required?: boolean;
  title?: string;
  details?: string | React.ReactNode;
  value?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input = ({
  required,
  title,
  details,
  value,
  name,
  onChange,
  error,
  placeholder,
  onKeyUp,
}: InputProps) => {
  return (
    <div>
      <div>
        {title && <Text>{title}</Text>} {required && <Text color="red">*</Text>}
      </div>
      {details && (
        <div>
          <Text>{details}</Text>
        </div>
      )}
      <div>
        <InputElWithoutErrorBelow
          type="text"
          fullWidth
          {...{ value, name, onChange, placeholder, error, onKeyUp }}
        />
        {error && (
          <Box p={5}>
            <Flex direction="row" items="center">
              <Text color="red">
                <Icon type="WarningTriangleFilled" />
              </Text>
              <Text color="red">&nbsp;{error}</Text>
            </Flex>
          </Box>
        )}
      </div>
    </div>
  );
};

// Hide error-space from this component and use the custom one
// this way we can also have the icon
const InputElWithoutErrorBelow = styled(InputEl)`
  > div.error-space {
    display: none;
  }
`;

export default Input;
