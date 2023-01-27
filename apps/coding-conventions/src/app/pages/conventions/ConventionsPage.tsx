import { createLink } from '@cognite/cdf-utilities';
import {
  Button,
  Flex,
  Input,
  Label,
  Select,
  Title,
  toast,
  Tooltip,
} from '@cognite/cogs.js';
import { uniqueId } from 'lodash';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../../components/Header/Header';
import { ManageSelectedConvention } from '../../containers/ManageSelectedConvention';
import { dummyConventions } from '../../service/conventions';
import { Page } from '../elements';
import { Convention } from './types';

export const ContentionsPage = () => {
  const { id } = useParams();
  const convention = dummyConventions.find((item) => item.id === id)!;

  const [visible, setVisible] = useState(false);
  const toggleVisibility = () => setVisible((prevState) => !prevState);

  const selectedConventionId = useRef<string | null>(null);

  const [selectMode, setSelectMode] = useState(false);
  const [conventions, setConventions] = useState<Convention[]>(
    convention.conventions
  );

  const handleSelectionChange = (newSelection: Selection | null) => {
    if (newSelection === null) return;

    const startOffset = newSelection.getRangeAt(0).startOffset;
    const endOffset = newSelection.getRangeAt(0).endOffset;

    if (startOffset === endOffset) return;

    for (const { range } of conventions) {
      if (startOffset < range.end && range.start < endOffset) {
        throw new Error('Selection on these ranges have already been made.');
      }
    }

    setConventions((prevState) => [
      ...prevState,
      {
        range: {
          start: startOffset,
          end: endOffset,
        },
        keyword: newSelection.toString(),
        id: uniqueId(),
      },
    ]);
  };

  const renderStructureText = () => {
    if (selectMode || conventions.length === 0) {
      return <Text>{convention?.structure}</Text>;
    }

    const content = [];

    for (let i = 0; i < convention!.structure!.length; i++) {
      const selection = conventions.find((item) => {
        return item.range.start === i;
      });

      if (selection) {
        content.push(
          <Tooltip
            content={selection.name}
            disabled={!selection.name}
            key={`${selection.range.start}-${selection.range.end}`}
          >
            <SelectedText
              onClick={() => {
                selectedConventionId.current = selection.id;
                toggleVisibility();
              }}
            >
              {selection.keyword}
            </SelectedText>
          </Tooltip>
        );
        i = selection.range.end - 1;
      } else {
        content.push(<Text key={i}>{convention!.structure!.charAt(i)}</Text>);
      }
    }

    return content;
  };

  return (
    <Page>
      <Header
        title="Mark conventions"
        subtitle="Proceed to group the structure text by selecting/marking the keywords that ... with your mouse, followed by pressing the complete button"
        breadcrumbs={[
          {
            title: 'Coding conventions',
            link: createLink('/coding-conventions'),
          },
          { title: convention!.title },
        ]}
      />

      <Content>
        <Container>
          <Title
            onDoubleClick={() =>
              alert('Mark the text, double click is not supported')
            }
            onMouseUp={() => {
              if (selectMode === false) {
                return;
              }

              try {
                const currentSelection = window.getSelection();
                handleSelectionChange(currentSelection);
              } catch (error: any) {
                toast.error(error.message, { position: 'bottom-center' });
              }
            }}
          >
            {renderStructureText()}
          </Title>

          <Button
            onClick={() => setSelectMode((prevMode) => !prevMode)}
            icon={selectMode ? 'Checkmark' : 'Edit'}
            type={selectMode ? 'primary' : 'secondary'}
          />
        </Container>

        {selectMode && conventions.length > 0 && (
          <SelectionContainer>
            Selected:
            {conventions
              .sort((a, b) => a.range.start - b.range.start)
              .map((selection) => (
                <Tooltip
                  key={selection.id}
                  content={`Range: ${selection.range.start}-${selection.range.end}`}
                  position="bottom"
                >
                  <KeywordLabel>{selection.keyword}</KeywordLabel>
                </Tooltip>
              ))}
          </SelectionContainer>
        )}
      </Content>

      {/* This needs to be wrapped, we expect the modal to be (un)mouted for each selection */}
      {visible && (
        <ManageSelectedConvention
          conventions={conventions}
          selectedConvention={
            selectedConventionId.current
              ? conventions.find(
                  (item) => item.id === selectedConventionId.current
                )
              : undefined
          }
          onChange={(updatedConvention) => {
            setConventions((prevState) => {
              return [
                ...prevState.filter((item) => item.id !== updatedConvention.id),
                updatedConvention,
              ];
            });
          }}
          toggleVisibility={toggleVisibility}
        />
      )}
    </Page>
  );
};

const SelectionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
`;

const Content = styled.section`
  padding: 24px 156px;
  margin-top: 200px;
  display: flex;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const SelectedText = styled.div`
  border: 2px solid grey;
  display: inline-block;
  white-space: pre;
  border-radius: 4px;
  cursor: pointer;
`;

const Text = styled.div`
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  display: inline-block;
  white-space: pre;
`;

const KeywordLabel = styled(Label).attrs({
  iconPlacement: 'right',
  icon: 'Delete',
})`
  cursor: pointer !important;
  position: relative;

  i {
    color: var(--cogs-decorative--red--500);
  }

  &:hover {
    box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.1),
      0px 1px 1px rgba(79, 82, 104, 0.1);
  }
`;
