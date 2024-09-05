#!/bin/bash

# Define the source and destination directories
SOURCE_DIR="extension_mv2"
BUILD_DIR="build"
TARGET_ZIP="mooltipass_extension.zip"
FIRST_RUN_DOCS_DIR="$BUILD_DIR/first_run_documents"

# Check if the source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Source directory $SOURCE_DIR does not exist."
  exit 1
fi

# Remove existing contents of the build directory
if [ -d "$BUILD_DIR" ]; then
  rm -rf "$BUILD_DIR"/*
  echo "Cleaned up existing contents in $BUILD_DIR"
else
  mkdir -p "$BUILD_DIR"
fi

# Inject Scripts
cp "${SOURCE_DIR}/mooltipass-content.js" "${BUILD_DIR}/mooltipass-content.js"
cp "${SOURCE_DIR}/mooltipass-content.css" "${BUILD_DIR}/mooltipass-content.css"
cp "${SOURCE_DIR}/manifest.json" "${BUILD_DIR}/"

# Copy the contents of the extension_mv2 folder into the build folder
for ext_dir in vendor popups css options background images icons ui content_scripts _locales first_run_documents shared_scripts; do
	cp -Rf "${SOURCE_DIR}/${ext_dir}" "${BUILD_DIR}/"
done

if [ "${ENABLE_EMULTATION_MODE}" != '0' ] && [ -f "${BUILD_DIR}/vendor/mooltipass/device.js" ]; then
	if ! sed -i 's/mooltipass.device.emulation_mode = false/mooltipass.device.emulation_mode = true/' \
		 "${BUILD_DIR}/vendor/mooltipass/device.js"; then
		echo "[ERROR] Cannot set emulation mode" 1>&2
	fi
fi

# Check if an argument is provided
if [ -n "$1" ]; then
  # Iterate through each folder in the first_run_documents directory
  for folder in "$FIRST_RUN_DOCS_DIR"/*; do
    # Check if the item is a directory and its name does not match the provided argument
    if [ -d "$folder" ] && [ "$(basename "$folder")" != "$1" ]; then
      rm -rf "$folder"
      echo "Removed $folder"
    fi
  done
else
  echo "No folder specified for exclusion, skipping deletion."
fi

# Check if zip is installed
if ! command -v zip &> /dev/null; then
  echo "zip command not found. Please install zip and try again."
  exit 1
fi

# Remove existing mooltipass_extension.zip if it exists
if [ -f "$TARGET_ZIP" ]; then
  rm -f "$TARGET_ZIP"
  echo "Removed existing $TARGET_ZIP"
fi

# Zip the contents of the build folder
cd "$BUILD_DIR" || exit
zip -r "../$TARGET_ZIP" .

# Go back to the original directory
cd ..

echo "Zip file $TARGET_ZIP created successfully."
