import { Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

const FunctionParameterFormLabel = ({
  label,
  description,
}: {
  label?: string;
  description?: string | null;
}) => {
  return (
    <Label>
      {label}
      {description && (
        <Tooltip content={description}>
          <Icon type="Info" />
        </Tooltip>
      )}
    </Label>
  );
};

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  margin: 5px 10px 0 0;

  span {
    vertical-align: sub;
    margin-left: 5px;
  }
`;

export default FunctionParameterFormLabel;
