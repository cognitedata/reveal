import { Button, Tooltip } from '@cognite/cogs.js';
import { Cognite3DViewer } from '@cognite/reveal';
import { notification } from 'antd';
import { getURLWithThreeDViewerState } from 'app/containers/ThreeD/utils';

type ShareButtonProps = {
  viewer: Cognite3DViewer | null;
};

const ShareButton = ({ viewer }: ShareButtonProps): JSX.Element => {
  const handleShare = async () => {
    const stringifiedState = JSON.stringify(viewer?.getViewState());
    const link = getURLWithThreeDViewerState(stringifiedState);
    await navigator.clipboard.writeText(`${link}`);
    notification.info({
      key: 'clipboard',
      message: 'Clipboard updated',
      description: `Sharable link with viewer state is now available in your clipboard.`,
    });
  };

  return (
    <Tooltip content="Copy viewer state to clipboard">
      <Button icon="Share" onClick={handleShare} type="ghost" />
    </Tooltip>
  );
};

export default ShareButton;
