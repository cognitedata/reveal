import React from 'react';

import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';

import ThreeDeePreviewV2 from './v2/ThreeDeePreview';
import ThreeDeePreviewV3 from './v3/ThreeDeePreview';

export const ThreeDee: React.FC = () => {
  const enableWellSdkV3 = useEnabledWellSdkV3();

  return enableWellSdkV3 ? <ThreeDeePreviewV3 /> : <ThreeDeePreviewV2 />;
};

export default ThreeDee;
