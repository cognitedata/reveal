# @cognite/react-version

Get the version of your application

## Installation

```sh
yarn add @cognite/react-version
```

## Usage

```ts
import { Version } from '@cognite/react-version';

import { FooterContainer } from './elements';

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <Version />
    </FooterContainer>
  );
};
```

Happy hacking!
