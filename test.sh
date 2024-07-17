#!/bin/bash

LOOPS=1000000
export REPEAT=1
export LENGTH=100

echo "Number of executions: $LOOPS"
echo "Single string length: $LENGTH"
echo "Extended string repeats: $REPEAT"

node test.mjs LEGACY $LOOPS
node test.mjs SINGLE $LOOPS
node test.mjs SMART $LOOPS
node test.mjs REPLACER $LOOPS
node test.mjs CRUDE $LOOPS
node test.mjs NAMED $LOOPS
node test.mjs GFM $LOOPS
