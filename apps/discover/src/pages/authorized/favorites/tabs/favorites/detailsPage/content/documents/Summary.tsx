import { NOT_AVAILABLE } from 'constants/empty';

import {
  SummaryWrapper,
  StyledInlineLink,
  FilePathContainer,
  P,
} from '../../../elements';

interface Props {
  filename: string;
  filepath?: string;
  truncatedContent?: string;
  openPreview: () => void;
}
export const Summary: React.FC<Props> = ({
  filename,
  filepath,
  truncatedContent,
  openPreview,
}) => {
  return (
    <SummaryWrapper>
      <StyledInlineLink onClick={() => openPreview()}>
        {filename}
      </StyledInlineLink>
      {filepath && <FilePathContainer>{filepath}</FilePathContainer>}
      <P>{truncatedContent || NOT_AVAILABLE}</P>
    </SummaryWrapper>
  );
};
