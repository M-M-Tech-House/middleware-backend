#!/bin/bash

# Load environment variables from the parent directory .env file
if [ -f ../.env ]; then
  echo "Loading environment variables from ../.env"
  set -a # automatically export all variables
  source .env
  set +a
else
  echo "Warning: ../.env file not found."
fi

# Run the started command
npm i
