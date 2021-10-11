import { render, screen } from '@testing-library/react';

import {
  Flex,
  FlexGrow,
  Relative,
  DisplayRelative,
  FlexColumn,
  FlexShrinkWrap,
  FlexAlignItems,
  Center,
  MarginBottomSmallContainer,
  MarginRightLargeContainer,
  MarginRightSmallContainer,
} from '../layout';

describe('layout', () => {
  const TestString = 'TEST';
  const TestContent = () => <div>{TestString}</div>;

  it('first level should be ok', () => {
    render(
      <>
        <Flex>
          <FlexGrow>
            <Relative>
              <DisplayRelative>
                <TestContent />
              </DisplayRelative>
            </Relative>
          </FlexGrow>
        </Flex>
      </>
    );

    expect(screen.getByText(TestString)).toBeInTheDocument();
  });

  it('second level should be ok', () => {
    render(
      <>
        <FlexShrinkWrap>
          <FlexColumn>
            <FlexAlignItems>
              <Center>
                <TestContent />
              </Center>
            </FlexAlignItems>
          </FlexColumn>
        </FlexShrinkWrap>
      </>
    );

    expect(screen.getByText(TestString)).toBeInTheDocument();
  });

  it('margins', () => {
    render(
      <>
        <MarginBottomSmallContainer>
          <MarginRightLargeContainer>
            <MarginRightSmallContainer>
              <TestContent />
            </MarginRightSmallContainer>
          </MarginRightLargeContainer>
        </MarginBottomSmallContainer>
      </>
    );

    expect(screen.getByText(TestString)).toBeInTheDocument();
  });
});
