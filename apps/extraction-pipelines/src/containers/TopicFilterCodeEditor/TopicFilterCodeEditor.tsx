import React, { useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter, Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';

import { kuiper } from '@cognite/codemirror-lang-kuiper';
import { Body, Flex } from '@cognite/cogs.js';
import {
  KuiperExpression,
  KuiperError,
  compile_expression,
} from '@cognite/kuiper_js';

import { useTranslation } from '../../common';
import { CodeEditorWithStatus } from '../../components/CodeEditorWithStatus';
import { formatJSCode } from '../../utils/codeFormatUtils';

// JSON Language Support
const jsonLang = json();

const TopicFilterCodeEditor = ({
  showSampleData = false,
  onChangeFormat,
}: {
  showSampleData?: boolean;
  onChangeFormat: (format: string) => void;
}) => {
  const { t } = useTranslation();
  const [sampleData, setSampleData] = React.useState<string>('');
  const [customFormatString, setCustomFormatString] = useState<string>('');
  const [expression, setExpression] = React.useState<
    KuiperExpression | undefined
  >();
  const [sampleError, setSampleError] = useState('');
  const [codeCompileError, setCodeCompileError] = useState('');

  const lang = useMemo(() => {
    return kuiper([
      {
        label: 'input',
        description: t('input-kuiper-description'),
      },
      {
        label: 'context',
        description: t('context-kuiper-description'),
      },
    ]);
  }, [t]);

  const handleChange = useCallback(
    (value: string) => {
      let expr: KuiperExpression | undefined = undefined;
      try {
        expr = compile_expression(value, ['input', 'context']);

        if (expression) {
          expression.free();
        }
        setCodeCompileError('');
        setExpression(expr);
      } catch (err: any) {
        if (err.message) {
          setCodeCompileError(err.message);
        }
        if (err instanceof KuiperError) {
          err.free();
        }
      } finally {
        setCustomFormatString(value);
      }
    },
    [expression]
  );

  const lintReal = useCallback(
    (view: EditorView): Diagnostic[] => {
      const data = view.state.doc.toString();
      let expr: KuiperExpression | undefined;
      try {
        expr = compile_expression(data, ['input', 'context']);
      } catch (err: any) {
        if (err instanceof KuiperError) {
          const diagnostics: Diagnostic[] = [];
          if (err.start !== undefined && err.end !== undefined) {
            diagnostics.push({
              from: err.start,
              to: err.end,
              severity: 'error',
              message: err.message,
            });
          }
          err.free();
          return diagnostics;
        }
        return [];
      }

      try {
        if (expr && !sampleError) {
          expr.run_multiple_inputs([
            JSON.parse(sampleData),
            { topic: 'my_topic' },
          ]);
        }
      } catch (err: any) {
        if (err instanceof KuiperError) {
          const diagnostics: Diagnostic[] = [];
          if (err.start !== undefined && err.end !== undefined) {
            diagnostics.push({
              from: err.start,
              to: err.end,
              severity: 'error',
              message: err.message,
            });
          }
          err.free();
          return diagnostics;
        }
      } finally {
        if (expr) {
          expr.free();
        }
      }
      return [];
    },
    [sampleError, sampleData]
  );

  const onChangeSample = useCallback((value: string) => {
    try {
      JSON.parse(value);
      setSampleError('');
    } catch (err: any) {
      setSampleError(err.message);
    } finally {
      setSampleData(value);
    }
  }, []);

  const [output, setOutput] = useState<string | undefined>();

  const transform = useCallback(() => {
    if (expression && !sampleError) {
      try {
        const res = expression.run_multiple_inputs([
          JSON.parse(sampleData),
          { topic: 'my_topic' },
        ]);
        const out = JSON.stringify(res, null, 4);
        setOutput(out);
      } catch (err: any) {
        setOutput(
          t('error-occurred-in-transformation', {
            message: `${err.message}`,
          })
        );
        if (err instanceof KuiperError) {
          err.free();
        }
      }
    }
  }, [expression, sampleError, sampleData, t]);

  useEffect(() => {
    if (!codeCompileError && !sampleError) {
      transform();
    } else if (sampleError) {
      setOutput(
        t('error-in-sample-code', {
          message: sampleError,
        })
      );
    } else if (codeCompileError) {
      setOutput(
        t('error-in-transform-code', {
          message: `${codeCompileError}`,
        })
      );
    }
  }, [codeCompileError, sampleError, t, transform]);

  useEffect(() => {
    if (!codeCompileError) {
      onChangeFormat(customFormatString);
    }
  }, [customFormatString, onChangeFormat, codeCompileError]);

  const formatTransformCode = useCallback(async () => {
    try {
      const formattedString = formatJSCode(customFormatString);

      setCustomFormatString(formattedString);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log(
        'Error occurred while formatting transform code',
        error.message
      );
    }
  }, [customFormatString]);

  const formatSampleJson = useCallback(async () => {
    try {
      const formattedString = formatJSCode(sampleData);

      setSampleData(formattedString);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log(
        'Error occurred while formatting sample json code',
        error.message
      );
    }
  }, [sampleData]);

  return (
    <EditorContainer direction="column" gap={32}>
      {showSampleData && (
        <Flex direction="column" gap={8}>
          <EditorTitle
            size="medium"
            strong
            data-testid="sample-code-editor-title"
          >
            {t('sample-json-data')}
          </EditorTitle>
          <CodeEditorWithStatus
            placeholder={t('paste-in-sample-data-here')}
            onChange={onChangeSample}
            value={sampleData}
            extensions={[jsonLang, linter(jsonParseLinter())]}
            onFormat={formatSampleJson}
            testId="sample-code-editor"
          />
        </Flex>
      )}

      <Flex direction="column" gap={8}>
        <EditorTitle
          size="medium"
          strong
          data-testid="transform-code-editor-title"
        >
          {t('transformation-code')}
        </EditorTitle>
        <CodeEditorWithStatus
          placeholder={t('transformation-code-placeholder')}
          onChange={handleChange}
          value={customFormatString}
          extensions={[lang, linter(lintReal)]}
          onFormat={formatTransformCode}
          testId="transform-code-editor"
        />
      </Flex>
      {showSampleData && (
        <Flex direction="column" gap={8}>
          <EditorTitle size="medium" strong data-testid="preview-title">
            {t('sample-result')}
          </EditorTitle>
          <SampleOutPutContainer data-testid="preview">
            <Body size="small" muted>
              <PreviewContainer>
                <code>{output}</code>
              </PreviewContainer>
            </Body>
          </SampleOutPutContainer>
        </Flex>
      )}
    </EditorContainer>
  );
};

const SampleOutPutContainer = styled.div`
  display: flex;
  height: 294px;
  justify-content: flex-start;
  align-items: self-start;
  align-self: stretch;
  border-radius: 6px;
  overflow-y: scroll;
  background: var(--surface-medium, #fafafa);
`;

const EditorTitle = styled(Body)``;

const EditorContainer = styled(Flex)``;

const PreviewContainer = styled.pre`
  user-select: all; /* Standard syntax */
`;
export default TopicFilterCodeEditor;
