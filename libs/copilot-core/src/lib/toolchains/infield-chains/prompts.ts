/* eslint-disable */
export const DETECT_LANGUAGE_PROMPT = `
You should perform the following steps:
1. Detect the language of the input text, in the form "English", "Norwegian", "German", etc.
2. Translate the input text to English. If already in English, return the input text.
3. Return the data in only and exacly the following JSON format, replacing the [] with curly braces:
[
        "language": language,
        "translation": translation
]
It is absolutely critical that you return the data in the exact format specified above, even if you do not have a good answer.
Now perform these steps on the following input:
***{input}***
`;

export const QUERY_SINGLE_CONTEXT_PROMPT = `
As an information processor, you are required to answer a query solely based on the specific document data provided.
Your response should rely entirely on the details and context found within this data subset and should not incorporate any external information or context.

In instances where the data subset does not contain the answer to the query, or the data you need is not provided, your response MUST be "WARNING REMOVE WARNING".
Please avoid supplying any explanations such as "no data available", "unable to provide an answer", or other phrases explaining the reason for the lack of an answer.
If the data cannot provide an answer, the only approved response is only "WARNING REMOVE WARNING"

Now, considering these guidelines, please answer the following query:
***{input}***
The required information for this question is found within the provided document data:
***{context}***

Ensure your answer is succinct, relevant, and anchored in the by the provided context.
Your response should exhibit an accurate understanding and application of the data given.
`;

export const QUERY_SUMMARIZE_ANSWERS_PROMPT = `
As an AI, your task is to condense several unique responses from a language model into one successfully communicated and clear summary tailored to a given query or question.
This should highlight all relevant information and details, and align the narrative cohesively, even when the source responses disagree, leading to a single unified summary. 

In compiling your summary, it is critical to avoid incorporating new ideas or data not presented within the original responses.
Redundant information, as well as those tagged as "null" or indicating the lack of details, should be left out. 

In the case where the model's responses fail to contain any relevant information to satisfy the query, kindly inform the user of the absence of pertinent data. 

Your final output should be compact, distinct and focus on meaningful details, eliminating any superfluous elements for seamless understanding.

Consider the input encapsulated within the triple backticks as the question:
´´´{input}´´´

Your job is to analyze the corresponding responses, also captured within triple backticks, and then derive a comprehensive and concise summary:
´´´{context}´´´

Please state your answer in the following language, to the best of your ability without compromising information: {language}
`;

export const SUMMARY_SINGLE_CONTEXT_PROMPT = `
Your task is to provide a summary based on this input:
{input}
using the information in the data enclosed in triple backticks:
´´´{context}´´´
`;

export const SUMMARY_MULTI_CONTEXT_PROMPT = `
You will receive several summaries of text constructed by a language model.
Your task is to summarize the following text enclosed in triple backticks:
´´´{context}´´´
`;
