#!/bin/bash

echo "Starting mongo-connector"
mongo-connector -m localhost:27017 -t localhost:9200 -d elastic2_doc_manager --admin-username ccns --password CCNSccns &
MCPID=$!
echo "Mongo-connector started. PID=$MCPID"
BASEDIR=$(dirname "$0")
(cd $BASEDIR/pages && ./update_pages.sh && cd ..)
node run
echo "Killing mongo-connector. PID=$MCPID"
kill $MCPID
echo "Success"
