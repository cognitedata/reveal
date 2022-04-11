from importlib.metadata import metadata
import os
from py_utils.client import get_client
from py_utils.contants import DIAGRAM_PARSER_SOURCE

def main():
    client = get_client()

    graphs_dir = './graphs'

    graph_metadata = {
      'type': 'graph'
    }

    file_list = client.files.list(
      limit = None,
      mime_type = 'application/json',
      source = DIAGRAM_PARSER_SOURCE,
      metadata = graph_metadata
    )

    id_list = [metadata.id for metadata in file_list]

    print(f"Downloading {len(id_list)} files...")
    client.files.download(directory=graphs_dir, id=id_list)
    print(f"Finished downloading files to folder {graphs_dir}")

if __name__ == "__main__":
    main()
