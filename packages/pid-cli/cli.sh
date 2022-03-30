v=${v:-0.0.1}

while [ $# -gt 0 ]; do

   if [[ $1 == *"--"* ]]; then
        param="${1/--/}"
        declare $param="$2"
   fi

  shift
done

echo '-> Downloading graphs from CDF, please complete login in browser'
poetry run python download.py
echo '-> Matching and exporting graph documents'
yarn calc-lines --output-version $v
echo '-> Uploading files to CDF, please complete login in browser'
poetry run python upload.py
