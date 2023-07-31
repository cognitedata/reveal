import { Button, ButtonProps, ButtonSize, toast } from '@cognite/cogs.js';
import { useState } from 'react';

interface Props extends ButtonProps {
  size?: ButtonSize;
}

const ShareButton = ({ size = 'small', className = '' }: Props) => {
  const showText = size !== 'small';
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
      size={size}
      onClick={handleShare}
      className={className}
    >
      {showText && <>Share</>}
    </Button>
  );
};

export default ShareButton;
