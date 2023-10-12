import styled from 'styled-components';

import {
  Collapse,
  Radio as AntdRadio,
  RadioProps as AntdRadioProps,
} from 'antd';

import { Body, Colors, Flex } from '@cognite/cogs.js';

type RadioProps = Omit<AntdRadioProps, 'children'> & {
  title: string;
  subtitle?: string;
  description?: string;
};

const Radio = ({
  description,
  subtitle,
  title,
  ...otherProps
}: RadioProps): JSX.Element => {
  return (
    <AntdRadio {...otherProps}>
      <Flex direction="column">
        <Flex>
          <Body level={2} strong>
            {title}
          </Body>
          {subtitle && (
            <MutedBody level={2} strong>
              &nbsp;({subtitle})
            </MutedBody>
          )}
        </Flex>
        <MutedBody level={2}>{description}</MutedBody>
      </Flex>
    </AntdRadio>
  );
};

const MutedBody = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

const RadioCollapse = styled(Collapse)`
  && {
    .ant-collapse-header {
      padding: 0;
    }

    .ant-collapse-content-box {
      padding: 0;
    }
  }
`;

Radio.Group = AntdRadio.Group;
Radio.Collapse = RadioCollapse;

export default Radio;
