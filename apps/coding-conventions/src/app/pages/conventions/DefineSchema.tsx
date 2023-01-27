import { Input, Button } from '@cognite/cogs.js';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Convention } from './types';

const createTagPart = (
  selectedText: string,
  selectionStart: number,
  selectionEnd: number
) => {
  return {
    tagDefinition: selectedText,
    name: 'NewName',
    definitions: [],
    selectionRange: { start: selectionStart, end: selectionEnd },
  };
};

const highlightSelection = (tagPart: Convention, remove = false) => {
  const inputField = document.getElementById(
    'tagDefinition'
  ) as HTMLInputElement;
  if (remove) {
    inputField.setSelectionRange(0, 0);
    console.log('Remove');
    return;
  }

  if (
    inputField.selectionStart !== null &&
    inputField.selectionEnd !== null &&
    inputField.selectionStart !== inputField.selectionEnd
  ) {
    inputField.setSelectionRange(tagPart.range.start, tagPart.range.end);
    inputField.focus();
    console.log('Highlight');
  }
};

const DefineSchema = () => {
  const [tagDefinition, setTagDefinition] = useState('');
  const [data, setData] = useState([] as Convention[]);

  // Name
  // Type (Filename, assetTag)
  // TagDefinition
  // Data:[]

  const handleAddSubDefinition = () => {
    const inputField = document.getElementById(
      'tagDefinition'
    ) as HTMLInputElement;
    if (
      inputField.selectionStart !== null &&
      inputField.selectionEnd !== null &&
      inputField.selectionStart !== inputField.selectionEnd
    ) {
      const selectedText = inputField.value.substring(
        inputField.selectionStart,
        inputField.selectionEnd
      );
      const newTagPart = createTagPart(
        selectedText,
        inputField.selectionStart,
        inputField.selectionEnd
      );
      inputField.setSelectionRange(0, 0);
      // setData([...data, newTagPart]);
    }
  };

  return (
    <div>
      <h1>Define Schema</h1>

      <Input
        style={{ width: '40%', border: 'none', borderBottom: '1px solid #000' }}
        placeholder="NN-NN-NN"
        value={tagDefinition}
        id="tagDefinition"
        onChange={(e) => setTagDefinition(e.target.value)}
      />
      <Button
        type="primary"
        style={{ width: '40%', marginTop: '10px' }}
        onClick={handleAddSubDefinition}
      >
        Add
      </Button>

      <div>
        {data.map((item, index) => (
          <div key={index} onMouseEnter={() => highlightSelection(item)}>
            {/* <h1>{item.tagDefinition}</h1> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefineSchema;
