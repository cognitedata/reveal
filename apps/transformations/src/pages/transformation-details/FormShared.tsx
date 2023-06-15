import styled from 'styled-components';

import { Body, Colors, Flex, Icon, Tooltip } from '@cognite/cogs.js';

export const StyledFormContainer = styled.div`
  margin: 0px -4px;
  border-radius: 6px;
  background-color: ${Colors['surface--medium']};
`;

export const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  font-weight: 500;
  margin-bottom: 8px;

  .cogs-icon {
    vertical-align: middle;
  }
`;

export const StyledFormItemLabel = styled(
  ({ label, htmlFor, required, tooltip, className, ...props }) => {
    return (
      <Body level={2} strong className={className}>
        <Flex gap={4} display="inline-flex" alignItems="center">
          <label htmlFor={htmlFor} {...props}>
            {label}
          </label>
          {required && (
            <div className="label__asterisk">
              <span>*</span>
            </div>
          )}
          {tooltip && (
            <Tooltip content={tooltip}>
              <Icon size={11} type="InfoFilled" />
            </Tooltip>
          )}
        </Flex>
      </Body>
    );
  }
)`
  margin-bottom: 6px;

  .label__asterisk {
    color: ${Colors['text-icon--status-critical']};
    font-size: 16px;
    line-height: 1;
  }

  .cogs-icon {
    vertical-align: middle;
    path {
      fill: rgba(0, 0, 0, 0.45);
    }
  }
`;
