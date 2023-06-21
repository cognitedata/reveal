export const ROUTER_TEMPLATE =
  'Given a raw text input to a language model select the model ' +
  'prompt best suited for the input. You will be given the names of the ' +
  'available prompts and a description of what the prompt is best suited for. ' +
  'You may also revise the original input if you think that revising it will ' +
  'ultimately lead to a better response from the language model.\n\n' +
  '<< FORMATTING >>\n' +
  '{format_instructions}\n\n' +
  'REMEMBER: "destination" MUST be one of the candidate prompt names specified ' +
  'below OR it can be "DEFAULT" if the input is not well suited for any of the ' +
  'candidate prompts.\n' +
  'REMEMBER: "next_inputs" can just be the original input if you don\'t think ' +
  'any modifications are needed.\n\n' +
  '<< CANDIDATE PROMPTS >>\n' +
  '{destinations}\n\n' +
  '<< INPUT >>\n' +
  '{input}\n\n' +
  '<< OUTPUT  (remember to include the ```json)>>';
