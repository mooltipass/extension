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

# Create the build directory if it does not exist
mkdir -p "$BUILD_DIR"

# Copy the contents of the extension_mv2 folder into the build folder
cp -r "$SOURCE_DIR"/* "$BUILD_DIR"/

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

# Zip the contents of the build folder
cd "$BUILD_DIR" || exit
zip -r "../$TARGET_ZIP" .

# Go back to the original directory
cd ..

echo "Zip file $TARGET_ZIP created successfully."
