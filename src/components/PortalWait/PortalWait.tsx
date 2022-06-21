import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function waitForElement(id: string) {
  // eslint-disable-next-line consistent-return
  return new Promise<HTMLElement>((resolve) => {
    const element = document.getElementById(id);
    if (element) return resolve(element);

    const observer = new MutationObserver(() => {
      const obsElement = document.getElementById(id);
      if (obsElement) {
        resolve(obsElement);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

type Props = {
  elementId: string;
  children?: ReactNode;
};

const PortalWait = ({ children, elementId }: Props) => {
  const [elem, setElem] = useState<HTMLElement>();
  useEffect(() => {
    waitForElement(elementId).then((el) => setElem(el));
  }, [elementId]);

  return elem ? createPortal(children, elem) : null;
};

export default PortalWait;
