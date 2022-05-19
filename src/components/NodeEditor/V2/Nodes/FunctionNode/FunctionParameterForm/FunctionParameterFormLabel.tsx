import { Tooltip } from '@cognite/cogs.js';
import Markdown from 'components/Markdown/Markdown';
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
      <Tooltip maxWidth={350} content={description} disabled={!description}>
        <StyledMarkdown>{label || ''}</StyledMarkdown>
      </Tooltip>
    </Label>
  );
};

const Label = styled.label``;

const StyledMarkdown = styled(Markdown)`
  & > p {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    margin: 5px 10px 0 5px;
  }
`;

export default FunctionParameterFormLabel;
