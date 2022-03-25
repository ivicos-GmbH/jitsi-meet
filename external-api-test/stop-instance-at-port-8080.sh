#!/bin/bash
pids=$(lsof -t -i:8080)
chrlen=${#pids}
if [ $chrlen -ge 1 ]; then
    echo "Killing process with pid $pids on port 8080"
    kill -INT $pids
else
    echo "No processes to be killed on port 8080"
fi
