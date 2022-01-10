import { CogniteOrnate } from '@cognite/ornate';
import { useEffect } from 'react';

const useDebugOrnateRelativeMousePosition = (
  ornateRef: CogniteOrnate | undefined
) => {
  useEffect(() => {
    if (ornateRef) {
      const handler = () => {
        console.log('Mouse', ornateRef.stage.getRelativePointerPosition());
      };
      ornateRef.stage.on('mousemove', handler);

      return () => {
        ornateRef.stage.off('mousemove', handler);
      };
    }

    return () => undefined;
  }, [ornateRef]);
};

export default useDebugOrnateRelativeMousePosition;
