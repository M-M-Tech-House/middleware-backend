#!/bin/bash

# Load environment variables from parent directory if it exists
if [ -f "../.env" ]; then
    echo "Loading environment variables from ../.env"
    export $(grep -v '^#' ../.env | xargs)
fi

# Run the install command
npm install
