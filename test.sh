target='http://40ff26ef.bwtest-aws.pravala.com/384MB.jar'
testfiledest='./testfile/384MB.jar'
downloaddest='./downloads/384MB.jar'
chunksize=10000

if [ ! -e $testfiledest ]; then
    echo 'Comparison file not found, downloading it now'
    wget http://40ff26ef.bwtest-aws.pravala.com/384MB.jar --output-document=$testfiledest
fi

echo 'Testing with 1 chunk'
node multiGet.js $target -c 1
diff -s $downloaddest $testfiledest

echo 'Testing with 2 chunks'
node multiGet.js $target -c 4
diff -s $downloaddest $testfiledest

echo 'Testing with 7 chunks'
node multiGet.js $target -c 10
diff -s $downloaddest $testfiledest

echo 'Testing with 1 chunk, 10000 bytes'
node multiGet.js $target -c 1 -s $chunksize
cmp -n $chunksize -bl $downloaddest $testfiledest

echo 'Testing with 2 chunks, 10000 bytes'
node multiGet.js $target -c 2 -s $chunksize
cmp -n $chunksize -bl $downloaddest $testfiledest

echo 'Testing with 7 chunks, 10000 bytes'
node multiGet.js $target -c 7 -s $chunksize
cmp -n $chunksize -bl $downloaddest $testfiledest

rm $testfiledest
