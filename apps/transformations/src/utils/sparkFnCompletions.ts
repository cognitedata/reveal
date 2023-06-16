import { CompletionContext, snippetCompletion } from '@codemirror/autocomplete';
import { hoverTooltip } from '@codemirror/view';
import {
  sparkFnDocumentations,
  SparkFunctionType,
  SparkFunctionDocumentation,
} from '@transformations/utils';

export const sparkFnHoverTooltip = hoverTooltip((view, pos, side) => {
  // For reference to how we find words in editor content:
  // https://codemirror.net/examples/tooltip/
  const { from, to, text } = view.state.doc.lineAt(pos);
  let start = pos;
  let end = pos;
  while (start > from && /\w/.test(text[start - from - 1])) {
    start -= 1;
  }
  while (end < to && /\w/.test(text[end - from])) {
    end += 1;
  }
  if ((start === pos && side < 0) || (end === pos && side > 0)) {
    return null;
  }
  const fnName = text.slice(start - from, end - from);

  const fnDoc = sparkFnDocumentations.find(({ name }) => name === fnName);
  if (fnDoc) {
    return {
      pos: start,
      end,
      above: true,
      create() {
        const element = document.createElement('div');
        element.innerHTML = renderCompletionInfo(fnDoc);
        return { dom: element };
      },
    };
  }

  return null;
});

const getSparkFunctionTypeLabel = (type: SparkFunctionType): string => {
  switch (type) {
    case 'custom':
      return 'Cognite Custom SQL Function';
    case 'spark':
      return 'Built-in Spark SQL Function';
  }
};

const renderCompletionInfo = ({
  name,
  description,
  examples,
  type,
}: SparkFunctionDocumentation) => {
  return `
    <div class="spark-fn-completion-info-container">
      <div class="spark-fn-heading">
        <code class="spark-fn-name">${name}</code>
        <span class="spark-fn-type">${getSparkFunctionTypeLabel(type)}</span>
      </div>
      <span class="spark-fn-description">${description}</span>
      <code class="spark-fn-examples">
      ${examples.map(({ statement }) => `${statement}<br />`).join('')}
      </code>
    </div>
  `;
};

export const sparkFnCompletions = (context: CompletionContext) => {
  const word = context.matchBefore(/\w*/);
  if (!word) {
    return null;
  }

  if (word.from == word.to && !context.explicit) {
    return null;
  }

  const completions = sparkFnDocumentations.map((fn) => {
    return snippetCompletion(
      `${fn.name}(${
        fn.args?.map((arg, index) => `#{${index}:<${arg}>}`).join(', ') ?? ''
      })`,
      {
        label: fn.name,
        type: 'function',
        detail: fn.type,
        info: () => {
          const element = document.createElement('div');
          element.innerHTML = renderCompletionInfo(fn);
          return element;
        },
        // We use `boost` to reduce to rank of spark function completions. For
        // example, `from_csv` would be listed higher than `from` in the
        // autocompletion list if we don't reduce the rank of spark function
        // completions.
        boost: -1,
      }
    );
  });

  return {
    from: word.from,
    options: completions,
  };
};
