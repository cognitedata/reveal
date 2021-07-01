import React, { useState } from 'react';
import styled from 'styled-components';
import { Title } from '@cognite/cogs.js';
import { CollapsibleRadio } from '../CollapsibleRadio';

const RadioWrapper = styled.div`
  padding: 40px;
  background: white;

  & > * {
    margin-bottom: 12px;
  }
`;

export default { title: 'Molecules/CollapsibleRadio' };

export const Simple = () => {
  const [groupRadioValue, setGroupRadioValue] = useState('radio1');

  return (
    <RadioWrapper>
      <CollapsibleRadio
        name="radio1"
        value="radio1"
        groupRadioValue={groupRadioValue}
        setGroupRadioValue={setGroupRadioValue}
        title="Radio with only title"
        maxWidth={1024}
      />
      <CollapsibleRadio
        name="radio2"
        value="radio2"
        groupRadioValue={groupRadioValue}
        setGroupRadioValue={setGroupRadioValue}
        maxWidth={1024}
      >
        <div>Radio with only content</div>
      </CollapsibleRadio>
      <CollapsibleRadio
        name="radio3"
        value="radio3"
        groupRadioValue={groupRadioValue}
        setGroupRadioValue={setGroupRadioValue}
        title="Radio with both title..."
        maxWidth={1024}
      >
        <div>...and also content</div>
      </CollapsibleRadio>
      <CollapsibleRadio
        name="radio4"
        value="radio4"
        groupRadioValue={groupRadioValue}
        setGroupRadioValue={setGroupRadioValue}
        title="This radio has info icon"
        maxWidth={1024}
        info={
          <div>
            <h2 style={{ color: 'white' }}>You have hovered the info icon!</h2>
            <p>You are the MVP!</p>
          </div>
        }
      >
        <div>Hover it to see how it works</div>
      </CollapsibleRadio>
      <CollapsibleRadio
        name="radio5"
        value="radio5"
        groupRadioValue={groupRadioValue}
        setGroupRadioValue={setGroupRadioValue}
        title="Radio with collapsible section"
        maxWidth={1024}
        collapse={<Title level={1}>It&apos;s YOU! YOU are cool!</Title>}
      >
        <div>Choose me to see something cool</div>
      </CollapsibleRadio>
    </RadioWrapper>
  );
};

export const TwoDifferentGroups = () => {
  const [firstGroupRadioValue, setFirstGroupRadioValue] =
    useState('group1radio1');
  const [secondGroupRadioValue, setSecondGroupRadioValue] =
    useState('group2radio1');

  return (
    <>
      <RadioWrapper>
        <Title level={4}>Group 1</Title>
        <CollapsibleRadio
          name="group1radio1"
          value="group1radio1"
          groupRadioValue={firstGroupRadioValue}
          setGroupRadioValue={setFirstGroupRadioValue}
          title="Standard model"
        >
          <div>Something random</div>
        </CollapsibleRadio>
        <CollapsibleRadio
          name="group1radio2"
          value="group1radio2"
          groupRadioValue={firstGroupRadioValue}
          setGroupRadioValue={setFirstGroupRadioValue}
          title="Standard model"
        >
          <div>Another radio box</div>
        </CollapsibleRadio>
        <CollapsibleRadio
          name="group1radio3"
          value="group1radio3"
          groupRadioValue={firstGroupRadioValue}
          setGroupRadioValue={setFirstGroupRadioValue}
          title="Standard model"
        >
          <div>This one is last</div>
        </CollapsibleRadio>
      </RadioWrapper>
      <RadioWrapper>
        <Title level={4}>Group 2</Title>
        <CollapsibleRadio
          name="group2radio1"
          value="group2radio1"
          groupRadioValue={secondGroupRadioValue}
          setGroupRadioValue={setSecondGroupRadioValue}
          title="Standard model"
        >
          <div>Something random</div>
        </CollapsibleRadio>
        <CollapsibleRadio
          name="group2radio2"
          value="group2radio2"
          groupRadioValue={secondGroupRadioValue}
          setGroupRadioValue={setSecondGroupRadioValue}
          title="Standard model"
        >
          <div>Another radio box</div>
        </CollapsibleRadio>
        <CollapsibleRadio
          name="group2radio3"
          value="group2radio3"
          groupRadioValue={secondGroupRadioValue}
          setGroupRadioValue={setSecondGroupRadioValue}
          title="Standard model"
        >
          <div>This one is last</div>
        </CollapsibleRadio>
      </RadioWrapper>
    </>
  );
};

export const Experiment = () => {
  const [groupRadioValue, setGroupRadioValue] = useState('radio1');

  return (
    <RadioWrapper>
      <CollapsibleRadio
        name="radio1"
        value="radio1"
        groupRadioValue={groupRadioValue}
        setGroupRadioValue={setGroupRadioValue}
        title="Radio with very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long title"
      >
        <div>Some random content</div>
      </CollapsibleRadio>
      <CollapsibleRadio
        name="radio2"
        value="radio2"
        groupRadioValue={groupRadioValue}
        setGroupRadioValue={setGroupRadioValue}
        title="Just another radio"
      >
        <div>
          Radio with very very very very very very very very very very very very
          very very very very very very very very very very very very very very
          very very very very very very very very very very very very very very
          long content
        </div>
      </CollapsibleRadio>
      <CollapsibleRadio
        name="radio3"
        value="radio3"
        groupRadioValue={groupRadioValue}
        setGroupRadioValue={setGroupRadioValue}
        title="This one should be shorter..."
        maxWidth={600}
      >
        <div>
          ...despite having very very very very very very very very very very
          very very very very very very very very very very very very very very
          very very very very very very very very very very very very very very
          very very long content
        </div>
      </CollapsibleRadio>
    </RadioWrapper>
  );
};
