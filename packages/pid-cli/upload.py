import os
from python.client import get_client
from python.contants import DIAGRAM_PARSER_SOURCE

mime_types = {'.json': 'application/json',
              '.pdf': 'application/pdf', '.svg': 'image/svg+xml'}


def main():
    client = get_client()

    parsed_document_dir = './documents'
    parsed_documents = [os.path.join(parsed_document_dir, f)
                        for f in os.listdir(parsed_document_dir)]

    documents_for_upload = [*parsed_documents]

    for path in documents_for_upload:
        extension = os.path.splitext(path)[-1]
        if extension not in mime_types:
            print(f'Unsupported file extension {extension}')
            continue
        mime_type = mime_types[extension]
        name = os.path.basename(path)
        external_id = name
        mime_type = mime_type
        print({'path': path, 'name': name,
              'external_id': external_id, 'mime_type': mime_type})
        client.files.upload(path=path, name=name, mime_type=mime_type,
                            external_id=external_id, source=DIAGRAM_PARSER_SOURCE, overwrite=True)


if __name__ == "__main__":
    main()
