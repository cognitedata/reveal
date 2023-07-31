import { SidecarConfig } from '@cognite/sidecar';

export interface ContainerSidecarConfig extends SidecarConfig {
  disableTranslations?: boolean;
  disableLoopDetector?: boolean;
  disableSentry?: boolean;
  disableIntercom?: boolean;
  disableReactQuery?: boolean;
  disableMixpanel?: boolean;
  disableInternalMetrics?: boolean;
}
