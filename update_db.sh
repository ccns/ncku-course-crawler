#!/bin/bash

TIC=$(date +%s)

cd $(dirname "$0")
BASEDIR=$(pwd)
LOGDIR=${1:-$BASEDIR/log}
LOGFILE=$LOGDIR/update.log

echo "Starting mongo-connector" | $BASEDIR/predate.sh >> $LOGFILE
mongo-connector -m localhost:27017 -t localhost:9200 -d elastic2_doc_manager\
  -a ccns -p CCNSccns\
  --logfile $LOGDIR/mongo-connector.log --oplog-ts $LOGDIR/oplog.timestamp &
MCPID=$!
echo "Mongo-connector started. PID=$MCPID" | $BASEDIR/predate.sh >> $LOGFILE

(time bash -c "cd $BASEDIR/pages && ./update_pages.sh | $BASEDIR/predate.sh >> $LOGFILE && cd ..") 2>&1 | $BASEDIR/predate.sh >> $LOGFILE
node run | $BASEDIR/predate.sh >> $LOGFILE

echo "Killing mongo-connector. PID=$MCPID" | $BASEDIR/predate.sh >> $LOGFILE
kill $MCPID 2>&1 | $BASEDIR/predate.sh >> $LOGFILE
if [ $PIPESTATUS -eq 0 ]; then
  echo "All success." | $BASEDIR/predate.sh >> $LOGFILE
else
  echo "Kill mongo-connector failed." | $BASEDIR/predate.sh >> $LOGFILE
fi

TOC=$((`date +%s`-TIC))
echo "Total excution time: $TOC" | $BASEDIR/predate.sh >> $LOGFILE
