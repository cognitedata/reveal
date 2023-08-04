import { ReactNode } from 'react';

import {
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
  DecoratorNode,
} from 'lexical';

import { Chip } from '@cognite/cogs.js';

import { UserProfile } from '../../UserProfileProvider';

export type SerializedMentionNode = Spread<
  {
    mention: UserProfile;
  },
  SerializedLexicalNode
>;

function convertMentionElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const textContent = domNode.getAttribute('data-lexical-mention');

  if (textContent !== null) {
    const node = $createMentionNode(JSON.parse(textContent));
    return {
      node,
    };
  }

  return null;
}

function MentionComponent({ displayName }: { displayName: string }) {
  return (
    <Chip type="neutral" label={'@' + displayName} size="small" hideTooltip />
  );
}
export class MentionNode extends DecoratorNode<ReactNode> {
  __mention: UserProfile;
  __text: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__key);
  }
  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mention);
    return node;
  }

  // By convention, we prefix properties with __ (double underscore) so that
  // it makes it clear that these properties are private and their access should be avoided directly.
  // We opted for __ instead of _ because of the fact that
  // some build tooling mangles and minifies single _ prefixed properties to improve code size.
  // However, this breaks down if you're exposing a node to be extended outside of your build.

  // https://lexical.dev/docs/concepts/nodes

  constructor(mention: UserProfile, key?: NodeKey) {
    super(key);
    this.__mention = mention;
    this.__text = `<@${mention.userIdentifier}>`;
  }

  exportJSON(): SerializedMentionNode {
    return {
      mention: this.__mention,
      type: 'mention',
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const elem = document.createElement('span');
    elem.style.display = 'inline-block';
    return elem;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute(
      'data-lexical-mention',
      JSON.stringify(this.__mention)
    );
    element.textContent = this.__text;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-mention')) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 2,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  decorate() {
    return (
      <MentionComponent displayName={this.__mention.displayName as string} />
    );
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export function $createMentionNode(mention: UserProfile): MentionNode {
  const mentionNode = new MentionNode(mention);
  return mentionNode;
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode;
}
