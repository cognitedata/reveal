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
import { colors } from '../../colors';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse';
import { VerticalDivider } from '../../components/Divider';
import { ManageSelectedConvention } from '../../containers/ManageSelectedConvention';
import { dummyConventions } from '../../service/conventions';
import { Page } from '../elements';
import { Convention } from './types';

interface Props {
  id: string;
}

export const ContentionsPage: React.FC<Props> = ({ id }) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const system = dummyConventions.find((item) => item.id === id)!;

  const [selectMode, setSelectMode] = useState(false);
  const [conventions, setConventions] = useState<Convention[]>(
    system.conventions
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
      return <Text>{system?.structure}</Text>;
    }

    const content = [];

    for (let i = 0; i < system!.structure!.length; i++) {
      const selection = conventions.find((item) => {
        return item.range.start === i;
      });

      if (selection) {
        content.push(
          <SelectedText
            $color={colors[selection.range.start]}
            onClick={() => {
              setActiveKeys([selection.id]);
            }}
            key={`${selection.range.start}-${selection.range.end}`}
          >
            {selection.keyword}
          </SelectedText>
        );
        i = selection.range.end - 1;
      } else {
        content.push(<Text key={i}>{system!.structure!.charAt(i)}</Text>);
      }
    }

    return content;
  };

  return (
    <>
      <Header>
        <Title level={4}>Coding conventions for "File name"</Title>
        <Flex gap={8} alignItems="center">
          <Button
            onClick={() => setSelectMode((prevMode) => !prevMode)}
            icon={selectMode ? 'Checkmark' : 'Edit'}
            type={selectMode ? 'primary' : 'secondary'}
            aria-label="Edit mode"
          >
            {selectMode ? 'Done' : ''}
          </Button>
          {!selectMode && (
            <>
              <Button icon="Play" type="primary">
                Run
              </Button>
              <VerticalDivider />
              <Button icon="Close" aria-label="Close" />
            </>
          )}
        </Flex>
      </Header>

      <Content>
        {selectMode && (
          <SelectionContainer>
            Mark/select the characters below to form a convention group:
          </SelectionContainer>
        )}
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
        </Container>

        <BaseFilterCollapse
          editMode={selectMode}
          activeKeys={selectMode ? [] : activeKeys}
          onChange={(keys) => {
            setActiveKeys(keys);
          }}
          onIconClick={() => {
            console.log('HEY');
          }}
        >
          {conventions
            .sort((a, b) => a.range.start - b.range.start)
            .map((convention) => (
              <BaseFilterCollapse.Panel
                key={convention.id}
                editMode={selectMode}
                conventions={conventions}
                convention={convention}
                onChange={(updatedConvention) => {
                  setConventions((prevState) => {
                    return [
                      ...prevState.filter(
                        (item) => item.id !== updatedConvention.id
                      ),
                      updatedConvention,
                    ];
                  });
                }}
              >
                {!selectMode && (
                  <ManageSelectedConvention
                    conventions={conventions}
                    selectedConvention={convention}
                    onChange={(updatedConvention) => {
                      setConventions((prevState) => {
                        return [
                          ...prevState.filter(
                            (item) => item.id !== updatedConvention.id
                          ),
                          updatedConvention,
                        ];
                      });
                    }}
                  />
                )}
              </BaseFilterCollapse.Panel>
            ))}
        </BaseFilterCollapse>
      </Content>
    </>
  );
};

const SelectionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Content = styled.section`
  /* margin-top: 20px; */
  display: flex;
  align-items: center;
  padding: 16px;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
`;

const SelectedText = styled.div<{ $color: string }>`
  border: 2px solid ${(props) => props.$color};
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

const Header = styled.div`
  border-top: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
  height: 70px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  gap: 8px;
  margin-bottom: 16px;
`;
