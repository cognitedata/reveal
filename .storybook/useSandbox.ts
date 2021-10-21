import { useEffect, useRef } from 'react';
import sinon, { SinonSandbox } from 'sinon';

export type SetupMocks = (sandbox: SinonSandbox) => void;

const useMocks = (setupMocks: SetupMocks) => {
  const sandbox = sinon.createSandbox();
  const hasMocksBeenSet = useRef(false);
  if (!hasMocksBeenSet.current) {
    setupMocks(sandbox);
  }
  hasMocksBeenSet.current = true;

  useEffect(() => {
    return () => {
      sandbox.restore();
    };
  }, [sandbox]);
};

export default useMocks;
