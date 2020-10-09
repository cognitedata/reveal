import React, { useEffect, useState } from 'react';
import { SpacedRow } from 'components/Common';
import { ButtonProps } from '@cognite/cogs.js';

export type ButtonGroupProps = {
  children: React.ReactElement<ButtonProps>[];
  currentKey?: string;
  onButtonClicked?: (key: string) => void;
};

export const ButtonGroup = ({
  children,
  currentKey: propsCurrentKey,
  onButtonClicked = () => {},
}: ButtonGroupProps) => {
  const tabs = children.map(el => el.key) as string[];

  const [currentKey, setKey] = useState<typeof tabs[number]>(
    children[0].key as string
  );

  useEffect(() => {
    if (propsCurrentKey) {
      setKey(propsCurrentKey);
    }
  }, [propsCurrentKey]);

  return (
    <>
      <SpacedRow>
        {tabs.map((el, i) => {
          const key = el as typeof tabs[number];

          return React.cloneElement(children[i], {
            variant: key === currentKey ? 'default' : 'ghost',
            type: key === currentKey ? 'primary' : 'secondary',
            onClick: () => {
              setKey(key);
              onButtonClicked(key);
            },
            key,
          });
        })}
      </SpacedRow>
    </>
  );
};
