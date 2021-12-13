import { Body, Detail, Icon, Title } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const KeyboardShortcutModalContent = () => {
  return (
    <>
      <Title level={5} as="h1">
        Keyboard Shortcuts
      </Title>
      <ContentBody>
        <Section>
          <Title level={6} as="h2">
            Navigation
          </Title>
          <SectionBody>
            <Shortcut>
              <Body level={3}>Move left in image carousal</Body>
              <Icon type="ArrowLeft" size={12} />
            </Shortcut>
            <Shortcut>
              <Body level={3}>Move right in image carousal</Body>
              <Icon type="ArrowRight" size={12} />
            </Shortcut>
            <Separator />
            <Shortcut>
              <Body level={3}>Move up in annotation list</Body>
              <Icon type="ArrowUp" size={12} />
            </Shortcut>
            <Shortcut>
              <Body level={3}>Move down in annotation list</Body>
              <Icon type="ArrowDown" size={12} />
            </Shortcut>
            <Separator />
            <Shortcut>
              <Body level={3}>Move into annotation collection</Body>
              <CommandAndIcon>
                <CommandText>CMD / CTRL +</CommandText>
                <Icon type="ArrowDown" size={12} />
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Move out of annotation collection</Body>
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
              <Body level={3}>Selection Tool</Body>
              <CommandAndIcon>
                <CommandText>V</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Panning Tool (hand)</Body>
              <CommandAndIcon>
                <CommandText>H</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Keypoint collection</Body>
              <CommandAndIcon>
                <CommandText>K</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Polygon</Body>
              <CommandAndIcon>
                <CommandText>P</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Rectangle (bounding box)</Body>
              <CommandAndIcon>
                <CommandText>R</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Line</Body>
              <CommandAndIcon>
                <CommandText>L</CommandText>
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
              <Body level={3}>Set selected annotation as true</Body>
              <CommandAndIcon>
                <CommandText>Z</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Set selected annotation as false</Body>
              <CommandAndIcon>
                <CommandText>X</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Delete selected annotation</Body>
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
              <Body level={3}>
                Cancel (close annotation window without saving)
              </Body>
              <CommandAndIcon>
                <CommandText>ESC</CommandText>
              </CommandAndIcon>
            </Shortcut>
            <Shortcut>
              <Body level={3}>Confirm/Update (save and close)</Body>
              <CommandAndIcon>
                <CommandText>ENTER</CommandText>
              </CommandAndIcon>
            </Shortcut>
          </SectionBody>
        </Section>
      </ContentBody>
    </>
  );
};

const CommandText = styled(Detail)`
  font-weight: 400;
`;

const ContentBody = styled.div`
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
