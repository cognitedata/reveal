echo '-> Matching and exporting graph documents'
yarn calc-lines:prefer-file
echo '-> Uploading files to CDF, please complete login in browser'
poetry run python upload.py
