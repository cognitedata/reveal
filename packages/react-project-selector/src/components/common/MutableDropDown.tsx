import React from 'react';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import CreatableSelect from 'react-select/creatable';

import { Box, Text, Flex } from './index';

interface MutableDropDownProps {
  title?: string;
  required?: boolean;
  error?: string;
  details?: string | React.ReactNode;
  value: string | undefined;
  onChange: (value: string) => void;
  savedItems: string[];
  removeItem: (item: string) => void;
}

const mapToOption = (value: string) => ({ value, label: value });

const MutableDropDown = ({
  title,
  required,
  error,
  details,
  value,
  onChange,
  savedItems,
  removeItem,
}: MutableDropDownProps) => {
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
      <CreatableSelect
        value={mapToOption(value ?? '')}
        onChange={(e) => onChange(e?.value || '')}
        formatCreateLabel={(e) => `Use: ${e}`}
        noOptionsMessage={() => 'Start typing...'}
        components={{
          // eslint-disable-next-line react/no-unstable-nested-components
          Option: (params) => {
            const {
              label,
              selectOption,
              getValue,
              value: optionValue,
              data: { __isNew__: isNew },
            } = params as any;

            return (
              <OptionWrapper
                className={`${getValue()[0].value === optionValue && 'active'}`}
                onClick={() => selectOption(mapToOption(optionValue))}
              >
                <span>{label}</span>
                {!isNew && (
                  <div
                    role="button"
                    tabIndex={0}
                    className="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(label);
                    }}
                    onKeyPress={(e) => {
                      e.stopPropagation();
                      removeItem(label);
                    }}
                  >
                    <Icon type="Close" />
                  </div>
                )}
              </OptionWrapper>
            );
          },
        }}
        options={savedItems.map(mapToOption)}
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
  );
};

const OptionWrapper = styled.div`
  padding: 8px 12px;
  font-size: inherit;
  :hover {
    background-color: #deebff;
  }
  display: flex;
  flex-direction: row;
  align-items: center;
  > span {
    flex: 1;
  }
  > div.icon {
    cursor: pointer;
    height: 16px;
  }
  &.active {
    background-color: #2684ff;
    color: white;
  }
`;

export default MutableDropDown;
