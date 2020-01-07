#!/bin/bash
TARGET_DIR="$1"
TARGET_FILE=$TARGET_DIR/uploaded_sectors_simple.txt
rm -f $TARGET_FILE 2&>1 /dev/null
cd ../f3df
cargo build --features=dump
touch $TARGET_FILE

for filename in $TARGET_DIR/*.f3d; do
    ../target/debug/f3df-dump --stats --compact $filename >> $TARGET_FILE
    echo "" >> $TARGET_FILE
    echo -n "."
done
echo ""