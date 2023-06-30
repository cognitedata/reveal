import { ReactNode, useEffect, useState } from 'react';

type Props = {
  children: ReactNode;
  delay: number;
};
export default function DelayedComponent({ delay, children }: Props) {
  const [okToRender, setOk] = useState(false);

  useEffect(() => {
    setTimeout(() => setOk(true), delay);
  });

  if (okToRender) {
    return <>{children}</>;
  }
  return null;
}
