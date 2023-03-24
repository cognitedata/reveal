import { Body, Colors, Flex } from '@cognite/cogs.js';
import { Radio as AntdRadio, RadioProps as AntdRadioProps } from 'antd';
import styled from 'styled-components';

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

Radio.Group = AntdRadio.Group;

export default Radio;
