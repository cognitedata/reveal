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
      <P>{truncatedContent || 'N/A'}</P>
    </SummaryWrapper>
  );
};
