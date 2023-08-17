set -e

# Script that modifies the build for fusion-shell to include sdk-singleton, route-tracker
# Generates import-map.json and sub-apps-import-map.json

build_folder="dist/apps/fusion-shell"
packages_build_folder="dist/libs/shared";
configuration="${1:-staging}"

VERSION_HASH=`date +%s`
VERSION_HASH=$(echo "v-$VERSION_HASH" | base64)


# Clean the following folders
rm $build_folder/import-map.json;
rm -rf $build_folder/assets/dependencies/@cognite/$VERSION_HASH;
rm -rf $build_folder/assets/dependencies/@cognite/cdf-route-tracker;
rm -rf $build_folder/assets/dependencies/@cognite/cdf-sdk-singleton;

# # # And re-create them, so that we can copy the new files
mkdir -p $build_folder/assets/dependencies/@cognite/$VERSION_HASH;
mkdir $build_folder/assets/dependencies/@cognite/$VERSION_HASH/cdf-route-tracker;
mkdir $build_folder/assets/dependencies/@cognite/$VERSION_HASH/cdf-sdk-singleton;

# # Copy the build from sdk-signleton and route-tracker to the fusion-shell assets folder
cp -r  $packages_build_folder/cdf-sdk-singleton/* $build_folder/assets/dependencies/@cognite/$VERSION_HASH/cdf-sdk-singleton;
cp -r  $packages_build_folder/cdf-route-tracker/* $build_folder/assets/dependencies/@cognite/$VERSION_HASH/cdf-route-tracker;

# Generate Import Map Configs
node ./apps/fusion-shell/tools/scripts/import-map-generator.js $configuration $VERSION_HASH
