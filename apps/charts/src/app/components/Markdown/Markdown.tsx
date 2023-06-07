import ReactMarkdown from 'react-markdown';

import 'katex/dist/katex.min.css';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import rehypeKatex from 'rehype-katex';
import RemarkMathPlugin from 'remark-math';

function Markdown(props: ReactMarkdownOptions) {
  const newProps: ReactMarkdownOptions = {
    ...props,
    linkTarget: '_blank',
    remarkPlugins: [RemarkMathPlugin],
    rehypePlugins: [rehypeKatex],
  };

  return <ReactMarkdown {...newProps} />;
}

export default Markdown;
