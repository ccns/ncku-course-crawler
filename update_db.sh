#!/bin/bash

BASEDIR=$(dirname "$0")
(cd $BASEDIR/pages && ./update_pages.sh && cd ..)
node $BASEDIR/run
