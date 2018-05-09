#!/bin/bash
target='http://40ff26ef.bwtest-aws.pravala.com/384MB.jar'
testfiledest='./testfile/384MB.jar'
downloaddest='./downloads/384MB.jar'
filesize=10000

if [ ! -e $testfiledest ]; then
    echo 'Comparison file not found, downloading it now'
    wget http://40ff26ef.bwtest-aws.pravala.com/384MB.jar --output-document=$testfiledest
fi

echo "Testing with 1 chunk, $filesize bytes"
node multiGet.js $target -c 1 -s $filesize -n 'test1'
cmp -n $filesize -bl $downloaddest $testfiledest

echo "Testing with 2 chunks, $filesize bytes"
node multiGet.js $target -c 2 -s $filesize -n 'test2'
cmp -n $filesize -bl $downloaddest $testfiledest

echo "Testing with 3 chunks, $filesize bytes"
node multiGet.js $target -c 3 -s $filesize -n 'test3'
cmp -n $filesize -bl $downloaddest $testfiledest

echo 'Testing with 1 chunk'
node multiGet.js $target -c 1
diff -s $downloaddest $testfiledest

echo 'Testing with 2 chunks'
node multiGet.js $target -c 2
diff -s $downloaddest $testfiledest

echo 'Testing with 3 chunks'
node multiGet.js $target -c 3
diff -s $downloaddest $testfiledest


# rm $testfiledest
