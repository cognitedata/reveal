import { Button } from '@cognite/cogs.js';

const defaultStatusButtonStyle = {
  backgroundColor: 'var(--cogs-surface--strong)',
  color: 'var(--cogs-text-icon--muted)',
};

const runningStatusButtonStyle = {
  backgroundColor:
    'var(--cogs-surface--status-warning--strong--default--inverted)',
  color: 'var(--cogs-text-icon--muted)',
};

const finishedStatusButtonStyle = {
  backgroundColor:
    'var(--cogs-surface--status-success--strong--default--inverted)',
  color: 'var(--cogs-text-icon--muted)',
};

export const UndefindedStatusButton = () => {
  return (
    <Button icon="Assets" size="small" style={defaultStatusButtonStyle}>
      Loading...
    </Button>
  );
};

export const setStatusButtonIcon = ({
  finishedFileCount,
  collectionFileCount,
  runningFileCount,
}: {
  finishedFileCount: number;
  collectionFileCount: number;
  runningFileCount: number;
}) => {
  const cubeMapCount = collectionFileCount * 6;
  if (finishedFileCount >= cubeMapCount) {
    return 'Checkmark';
  }
  if (finishedFileCount === 0 && runningFileCount === 0) {
    return 'Assets';
  }
  return 'Loader';
};

export const setStatusButtonStyle = ({
  finishedFileCount,
  collectionFileCount,
  runningFileCount,
}: {
  finishedFileCount: number;
  collectionFileCount: number;
  runningFileCount: number;
}) => {
  const cubeMapCount = collectionFileCount * 6;
  if (finishedFileCount >= cubeMapCount) {
    return finishedStatusButtonStyle;
  }
  if (finishedFileCount === 0 && runningFileCount === 0) {
    return defaultStatusButtonStyle;
  }
  return runningStatusButtonStyle;
};

export const setStatusButtonText = ({
  finishedFileCount,
  collectionFileCount,
  runningFileCount,
}: {
  finishedFileCount: number;
  collectionFileCount: number;
  runningFileCount: number;
}) => {
  const cubeMapCount = collectionFileCount * 6;
  const filesProcessed = `${finishedFileCount}/${cubeMapCount}`;
  if (finishedFileCount >= cubeMapCount) {
    return 'Finished processing files: ' + filesProcessed;
  }
  if (finishedFileCount === 0 && runningFileCount === 0) {
    return 'No files processed: ' + filesProcessed;
  }
  return 'Processing files: ' + filesProcessed;
};
