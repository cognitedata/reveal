import { Detail, Icon, Micro, Title } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const KeyboardShortcutModalContent = () => {
  return (
    <>
      <Title level={4} as="h1">
        Keyboard Shortcuts
      </Title>
      <Body>
        <Section>
          <Title level={5} as="h2">
            Navigation
          </Title>
          <SectionBody>
            <Shortcut>
              <Micro>Move left in image carousal</Micro>
              <Icon type="ArrowLeft" size={12} />
            </Shortcut>
            <Shortcut>
              <Micro>Move right in image carousal</Micro>
              <Icon type="ArrowRight" size={12} />
            </Shortcut>
            <Separator />
            <Shortcut>
              <Micro>Move up in annotation list</Micro>
              <Icon type="ArrowUp" size={12} />
            </Shortcut>
            <Shortcut>
              <Micro>Move down in annotation list</Micro>
              <Icon type="ArrowDown" size={12} />
            </Shortcut>
            <Separator />
            <Shortcut>
              <Micro>Move into annotation collection</Micro>
              <CommandAndIcon>
                <CommandText>CMD / CTRL +</CommandText>
                <Icon type="ArrowDown" size={12} />
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Micro>Move out of annotation collection</Micro>
              <CommandAndIcon>
                <CommandText>CMD / CTRL +</CommandText>
                <Icon type="ArrowUp" size={12} />
              </CommandAndIcon>
            </Shortcut>
          </SectionBody>
        </Section>
        <Section>
          <Title level={5} as="h2">
            Tools
          </Title>
          <SectionBody>
            <Shortcut>
              <Micro>Selection Tool</Micro>
              <CommandAndIcon>
                <CommandText>V</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Micro>Panning Tool (hand)</Micro>
              <CommandAndIcon>
                <CommandText>H / SPACE (hold)</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Micro>Keypoint collection</Micro>
              <CommandAndIcon>
                <CommandText>K</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Micro>Polygon</Micro>
              <CommandAndIcon>
                <CommandText>P</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Micro>Rectangle (bounding box)</Micro>
              <CommandAndIcon>
                <CommandText>R</CommandText>
              </CommandAndIcon>
            </Shortcut>
          </SectionBody>
        </Section>
        <Section>
          <Title level={5} as="h2">
            Annotation List
          </Title>
          <SectionBody>
            <Shortcut>
              <Micro>Set selected annotation as true</Micro>
              <CommandAndIcon>
                <CommandText>Z</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Micro>Set selected annotation as false</Micro>
              <CommandAndIcon>
                <CommandText>X</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Micro>Delete selected annotation</Micro>
              <CommandAndIcon>
                <CommandText>BACKSPACE</CommandText>
              </CommandAndIcon>
            </Shortcut>
          </SectionBody>
        </Section>
        <Section>
          <Title level={5} as="h2">
            Annotation Window
          </Title>
          <SectionBody>
            <Shortcut>
              <Micro>Cancel (close annotation window without saving)</Micro>
              <CommandAndIcon>
                <CommandText>ESC</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Micro>Confirm/Update (save and close)</Micro>
              <CommandAndIcon>
                <CommandText>ENTER</CommandText>
              </CommandAndIcon>
            </Shortcut>
          </SectionBody>
        </Section>
      </Body>
    </>
  );
};

const CommandText = styled(Detail)`
  font-weight: 400;
`;

const Body = styled.div`
  padding-top: 32px;
`;
const Section = styled.div``;
const SectionBody = styled.div`
  padding: 8px 8px 20px 8px;
`;
const Shortcut = styled.div`
  height: 16px;
  padding-bottom: 5px;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
`;
const Separator = styled.div`
  height: 20px;
`;
const CommandAndIcon = styled.div`
  display: flex;
  gap: 5px;
`;
