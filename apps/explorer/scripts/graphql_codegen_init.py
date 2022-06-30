import yaml
from os.path import abspath
import subprocess
import json
import argparse


# yarn add dependencies and  install
inst_dep = input("install dependencies? (Y/N)")
if(inst_dep.upper() == 'Y'):
    commands = "cd ../..; yarn add graphql graphql-request; yarn add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-query"
    subprocess.run(commands,  shell=True)

# generate codegen and graphql fetcher file
parser = argparse.ArgumentParser()
parser.add_argument("-s", "--schema_path")
parser.add_argument("-d", "--document_path")
parser.add_argument("-o", "--output_path")
parser.add_argument("-y", "--yaml_path")
args = parser.parse_args()

schema_path = args.schema_path
document_path = args.document_path
generate_path = args.output_path
yaml_path = args.yaml_path

yaml_dict = {
    'overwrite': True,
    'schema': [{
        schema_path: {
            'headers': {'Authorization': 'Bearer ${{token}}'}
        }
    }],
    'documents': document_path,
    'generates': {
        generate_path:  {
            'plugins': ['typescript', 'typescript-operations', 'typescript-react-query'],
            'config': {
                'exposeQueryKeys': True,
                'operationResultSuffix': 'TypeGenerated',
                'fetcher': 'utils/graphqlFetcher#graphqlFetcher',
                'skipTypename': True
            }
        }
    }
}

with open(r"{}".format(abspath(yaml_path)), 'w') as file:
    documents = yaml.dump(yaml_dict, file, sort_keys=False)

with open(r"./src/utils/graphqlFetcher.ts", 'w') as file:
    file.write("""
import {{ getAuthHeaders }} from '@cognite/react-container';
import {{ GraphQLClient }} from 'graphql-request';

export const graphqlFetcher = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  headers?: RequestInit['headers']
) => {{
  const url = "{}";

  const graphQLClient = new GraphQLClient(url, {{
    headers: {{
      Authorization: getAuthHeaders().Authorization,
    }},
  }});

  return async (): Promise<TData> =>
    graphQLClient.request<TData, TVariables>(query, variables, headers);
}};""".format(schema_path))


# add a generate command to current package.json
with open(r"./package.json", 'r') as file:
    json_dict = json.load(file)
    file.close()
json_dict['scripts']['graphql:generate'] = '../../node_modules/.bin/graphql-codegen --config=' + yaml_path
with open(r"./package.json", 'w') as file:
    json.dump(json_dict, file, indent=2)
    file.close()
