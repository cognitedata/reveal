# GET STARTED

run `yarn install` to install typescript dependencies

run `poetry install` to install python dependencies

## Usage

Save/Copy the graphs you want to parse to the graphs folder

run `sh cli.sh` to compile the Graph Documents in the graphs folder and upload to CDF

### Calculate only

run `yarn calc-lines` to compile the Graph Documents in the graphs folder. Output is line info and parsed documents with annotations in the format used by linewalk

### Upload only

run `poetry run python upload.py` to upload whatever documents you have in the documents folder
