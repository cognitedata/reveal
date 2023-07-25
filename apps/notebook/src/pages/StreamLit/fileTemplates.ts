export interface FileTemplate {
  title: string;
  description: string;
  code: string;
}

export const fileTemplates: FileTemplate[] = [
  {
    title: 'Empty file with Cognite SDK',
    description: 'Empty file with imported SDK and Streamlit library.',
    code: `import streamlit as st
from cognite.client import CogniteClient

client = CogniteClient()`,
  },
  {
    title: 'Empty file',
    description: 'Start with a clean slate.',
    code: ``,
  },
];
