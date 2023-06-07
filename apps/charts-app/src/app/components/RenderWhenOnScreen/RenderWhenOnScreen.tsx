import React, { ReactNode, useRef } from 'react';
import { useOnScreen } from './hooks';

export const RenderWhenOnScreen: React.FC<{
  containerStyles: React.CSSProperties;
  loaderComponent: ReactNode;
  children: ReactNode;
}> = (props) => {
  const ref: any = useRef<HTMLDivElement>();
  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, '0px');
  return (
    <div style={props.containerStyles} ref={ref}>
      {onScreen ? props.children : props.loaderComponent}
    </div>
  );
};
