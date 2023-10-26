import { useCallback, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';

import styled from 'styled-components';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { TextNode } from 'lexical';
import { useDebounce } from 'use-debounce';

import { Avatar, Flex, Body, Chip } from '@cognite/cogs.js';

import { useUserProfilesSearch } from '../../hooks/use-query/useUserProfilesSearch';
import { UserProfile } from '../../UserProfileProvider';

import { $createMentionNode } from './MentionNode';

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const CapitalizedNameMentionsRegex = new RegExp(
  '(^|[^#])((?:' + DocumentMentionsRegex.NAME + '{' + 1 + ',})$)'
);

const TRIGGERS = ['@'].join('');

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS =
  '[^' + TRIGGERS + DocumentMentionsRegex.PUNCTUATION + '\\s]';

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  DocumentMentionsRegex.PUNCTUATION +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')';

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')$'
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$'
);

// At most, 5 suggestions are shown in the popup.

function checkForCapitalizedNameMentions(
  text: string,
  minMatchLength: number
): MenuTextMatch | null {
  const match = CapitalizedNameMentionsRegex.exec(text);

  if (match === null) {
    return null;
  }

  // The strategy ignores leading whitespace but we need to know it's
  // length to add it to the leadOffset
  const maybeLeadingWhitespace = match[1];
  const matchingString = match[2];

  if (matchingString === null || matchingString.length < minMatchLength) {
    return null;
  }

  return {
    leadOffset: match.index + maybeLeadingWhitespace.length,
    matchingString,
    replaceableString: matchingString,
  };
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number
): MenuTextMatch | null {
  const match =
    AtSignMentionsRegex.exec(text) ?? AtSignMentionsRegexAliasRegex.exec(text);

  if (match === null) {
    return null;
  }

  // The strategy ignores leading whitespace but we need to know it's
  // length to add it to the leadOffset
  const maybeLeadingWhitespace = match[1];
  const matchingString = match[3];

  if (matchingString.length < minMatchLength) {
    return null;
  }

  return {
    leadOffset: match.index + maybeLeadingWhitespace.length,
    matchingString,
    replaceableString: match[2],
  };
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  const match =
    checkForAtSignMentions(text, 1) ?? checkForCapitalizedNameMentions(text, 3);
  return match;
}

class MentionOption extends MenuOption {
  profile: UserProfile;

  constructor(profile: UserProfile) {
    super(profile.userIdentifier);
    this.profile = profile;
  }
}

function MentionsMenuItem({
  index,
  onClick,
  onMouseEnter,
  option,
  isSelected,
}: {
  index: number;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionOption;
  isSelected: boolean;
}) {
  return (
    <li
      tabIndex={-1}
      className={`mentions-menu-item ${
        isSelected ? 'mentions-menu-item-selected' : ''
      }`}
      key={option.key}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gap={10}>
          <Avatar text={option.profile.displayName} tooltip={false} />
          <Body size="small" strong>
            {option.profile.displayName}
          </Body>
        </Flex>
        <Chip label="Not in canvas" hideTooltip size="small" />
      </Flex>
    </li>
  );
}

const SEARCH_DEBOUNCE_MS = 200;

export default function MentionsPlugin() {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);
  const [debouncedQueryString] = useDebounce(queryString, SEARCH_DEBOUNCE_MS);

  const { userProfiles } = useUserProfilesSearch({
    name: debouncedQueryString || '',
  });
  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () => userProfiles.map((user) => new MentionOption(user)),
    [userProfiles]
  );
  const onSelectOption = useCallback(
    (
      selectedOption: MentionOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.profile);
        if (nodeToReplace !== null) {
          nodeToReplace.replace(mentionNode);
        }
        closeMenu();
      });
    },
    [editor]
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectOptionAndCleanUp, setHighlightedIndex, selectedIndex }
      ) =>
        anchorElementRef.current && userProfiles.length
          ? ReactDOM.createPortal(
              <div>
                <MentionsWrapper>
                  {options.map((option, i: number) => (
                    <MentionsMenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                </MentionsWrapper>
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}

const MentionsWrapper = styled('ul')`
  && > li {
    list-style-type: none;
  }
  position: absolute;
  top: 30px;
  padding: 6px;
  width: 340px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 0 0;
  border-radius: 6px;
  border: 1px solid var(--surface-muted, #fff);
  background: var(--surface-muted, #fff);
  box-shadow: 0px 1px 2px 0px rgba(79, 82, 104, 0.24),
    0px 1px 8px 0px rgba(79, 82, 104, 0.08),
    0px 1px 16px 4px rgba(79, 82, 104, 0.1);

  .mentions-menu-item {
    transition: all 0.2s;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
    flex: 1;
  }

  .mentions-menu-item:hover {
    background: rgba(83, 88, 127, 0.12);
  }
  .mentions-menu-item-selected {
    background: rgba(83, 88, 127, 0.12);
  }
`;
