#!/bin/bash
set -e

echo 'Compiling external js file'
make compile

echo 'Coyping the compiled js file to the artifacts repository'
mkdir -p artifacts/
cp build/* artifacts

echo 'List of generated build files'
ls artifacts