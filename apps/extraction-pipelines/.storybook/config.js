import React from 'react';
import styles from '@cognite/cogs.js/dist/cogs.css';
import { addDecorator } from '@storybook/react';

addDecorator((story) => {
  useEffect(() => {
    styles.use();
    return () => {
      styles.unuse();
    };
  }, []);
  return <div>{story()}</div>;
});
