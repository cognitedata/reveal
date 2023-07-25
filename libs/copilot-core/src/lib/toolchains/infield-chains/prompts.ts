export const TRANSLATION_PROMPT = `
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

export const WORKORDER_PROMPT = `
Given the work orders separated by triple backticks, you should return a list of work orders that meet the criteria in the query separated by <>.
The user may or may not specify the asset, but this is irrelevant, as the asset is always specified to you through the variable separated by <<>>.

You should be able to handle various types of queries, such as:
* 'List all work orders related to this asset': Then you should return the title of all work orders that have assetExternalId == {assetExternalId}
* 'List all work orders assigned to Mary Jane': Then you should return the title of all work orders that have assignedTo == 'Mary Jane'
* 'List all work orders that are due today': Then you should return the title of all work orders that have endTime == today
* 'What work order is due first?': Then you should return the title of the work order that has the earliest endTime

If you are unable to find any work orders that meet the criteria, you should return 'No work orders found'.

Now, use the examples above as a guieline to answer the following query:
Query: <{input}>
and use the work orders separated by triple backticks as your ONLY source of data:
Activities: ´´´{activities}´´´
and the following assetExternalId:
<<{assetExternalId}>>
If you cannot find the answer from the data provided, return 'I do not know'.

Please keep your answer as short as possible, and do not include any additional information.
If you refer to an internal variable, please do not include the variable name itself, but refer to its meaning instead. \
For instance, if you want to refer to the variable 'endTime', you should write 'the end time' or 'the deadline' instead of 'endTime'.
If a list is to be returned, only return the list of work orders, separated by ', '.

Please state your answer in the following language, to the best of your \
ability without compromising information: {language}
`;
