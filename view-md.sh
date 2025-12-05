#!/bin/bash

# Simple script to view markdown files in browser
# Usage: ./view-md.sh PRD.md

if [ -z "$1" ]; then
    echo "Usage: ./view-md.sh <markdown-file>"
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "File not found: $1"
    exit 1
fi

# Check if grip is installed
if command -v grip &> /dev/null; then
    echo "Starting markdown preview server..."
    echo "Opening in browser..."
    grip "$1" --browser
else
    echo "Grip not installed. Installing..."
    pip3 install grip
    echo "Starting markdown preview server..."
    grip "$1" --browser
fi


