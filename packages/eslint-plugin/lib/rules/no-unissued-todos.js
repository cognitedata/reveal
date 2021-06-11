/**
 * @fileoverview Rule to disallow unissed use of todos
 */

const { escapeRegExp } = require('lodash');
const RandExp = require('randexp');
const { isDirectiveComment } = require('../utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          terms: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          location: {
            type: 'string',
          },
          messageRequirement: {
            type: 'string',
          },
          issuePattern: {
            type: 'string',
          },
        },
      },
    ],
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const configuration = context.options[0] || {};
    const warningTerms = configuration.terms || ['todo', 'fixme', '@todo'];
    const location = configuration.location || 'start';
    const messageRequirement =
      configuration.messageRequirement || 'link to JIRA issue';
    const issuePattern =
      configuration.issuePattern || '\\((([A-Z][A-Z]+)-[0-9]+)\\)';
    const selfConfigRegEx = /\bno-unissued-todos\b/u;

    function convertToRegExp(term, issueRegex = '') {
      const escaped = escapeRegExp(term);
      const suffix = /\w$/u.test(term) ? '\\b' : '';

      if (location === 'start') {
        const prefix = '^\\s*';
        return new RegExp(prefix + escaped + suffix + issueRegex, 'iu');
      }

      const wordBoundary = '\\b';
      const eitherOrWordBoundary = `|${wordBoundary}`;
      const prefix = /^\w/u.test(term) ? wordBoundary : '';

      return new RegExp(
        prefix +
          escaped +
          suffix +
          issueRegex +
          eitherOrWordBoundary +
          term +
          wordBoundary +
          issueRegex,
        'iu'
      );
    }

    function convertToCommentIssuedRegEx(term) {
      return convertToRegExp(term, issuePattern);
    }

    const warningRegExps = warningTerms.map((warningTerm) =>
      convertToRegExp(warningTerm)
    );

    function findWarningTermMatches(comment) {
      return warningRegExps.reduce((matches, regex, index) => {
        if (regex.test(comment)) {
          matches.push(warningTerms[index]);
        }
        return matches;
      }, []);
    }

    function generateIssuePatternMatchExample(regex) {
      const randexp = new RandExp(regex);
      randexp.max = 2;
      return randexp.gen().toUpperCase().trim();
    }

    function reportIssue(node, matchedTerm, commentIssuedRegEx) {
      const message = `'${matchedTerm.toUpperCase()}' comments should include ${messageRequirement}, e.g ${generateIssuePatternMatchExample(
        commentIssuedRegEx
      )}`;

      context.report({
        node,
        message,
        data: {
          matchedTerm,
        },
      });
    }

    function processComment(node) {
      const comment = node.value;
      if (
        node.type === 'Shebang' &&
        isDirectiveComment(node) &&
        selfConfigRegEx.test(comment)
      ) {
        return;
      }

      const warningTermMatches = findWarningTermMatches(comment);
      warningTermMatches.forEach((matchedTerm) => {
        const commentIssuedRegEx = convertToCommentIssuedRegEx(matchedTerm);
        if (!commentIssuedRegEx.test(comment)) {
          reportIssue(node, matchedTerm, commentIssuedRegEx);
        }
      });
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();
        comments.forEach(processComment);
      },
    };
  },
};
