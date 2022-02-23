import { Button, toast } from '@cognite/cogs.js';
import { useState } from 'react';

const ShareButton = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <Button
      icon={isCopied ? 'Checkmark' : 'Share'}
      size="small"
      onClick={handleShare}
    />
  );
};

export default ShareButton;
