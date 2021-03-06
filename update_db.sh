#!/bin/bash

TIC=$(date +%s)

cd $(dirname "$0")
BASEDIR=$(pwd)
LOGDIR=${1:-$BASEDIR/log}
LOGFILE=$LOGDIR/update.log

echo -n "Start to fetch all course page ... "
(time bash -c "cd $BASEDIR/pages && ./update_pages.sh | $BASEDIR/predate.sh >> $LOGFILE && cd ..") 2>&1 | $BASEDIR/predate.sh >> $LOGFILE
echo "Finish"

echo -n "Start to update course ... "
node run | $BASEDIR/predate.sh >> $LOGFILE
echo "Finish"

echo "" | $BASEDIR/predate.sh >> $LOGFILE

TOC=$((`date +%s`-TIC))
echo "Finished. Total excution time: $TOC" | $BASEDIR/predate.sh >> $LOGFILE
