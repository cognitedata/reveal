import os
from python.client import get_client
from python.contants import DIAGRAM_PARSER_SOURCE, DOCUMENT_TYPE_GRAPH


graphs_dir = "./graphs"


def main():
    for f in os.listdir(graphs_dir):
        if os.path.splitext(f)[-1] == ".json":
            os.remove(os.path.join(graphs_dir, f))

    client = get_client()

    graph_metadata = {"type": DOCUMENT_TYPE_GRAPH}

    files = client.files.list(
        limit=-1,
        mime_type="application/json",
        source=DIAGRAM_PARSER_SOURCE,
        metadata=graph_metadata,
    )

    graph_file_ids = [metadata.id for metadata in files]

    client.files.download(graphs_dir, id=graph_file_ids)


if __name__ == "__main__":
    main()
