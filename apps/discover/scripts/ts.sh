#!/bin/bash

## count ts lines

ts=$(find src -name "*.ts*" | wc -l)
js=$(find src -name "*.js*" | wc -l)
total=$(expr $js + $ts)
echo 'Percent of project that is now TypeScript:'
echo ''
echo $(echo "scale=4; $ts/$total*100" | bc)
echo ''

# echo "Total:$total"
# echo "TS:$ts"
# echo "JS:$js"
