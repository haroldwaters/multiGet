target='http://40ff26ef.bwtest-aws.pravala.com/384MB.jar'

echo 'Testing with 1 chunk'
node index.js $target -c 1
diff -s downloads/test.txt testfile/384MB.jar

echo 'Testing with 2 chunks'
node index.js $target -c 2
diff -s downloads/test.txt testfile/384MB.jar

echo 'Testing with 4 chunks'
node index.js $target -c 4
diff -s downloads/test.txt testfile/384MB.jar

echo 'Testing with 1 chunk, 10000 bytes'
node index.js $target -c 1 -s 10000
cmp -n 1000 -bl downloads/test.txt testfile/384MB.jar

echo 'Testing with 2 chunks, 10000 bytes'
node index.js $target -c 2 -s 10000
cmp -n 10000 -bl downloads/test.txt testfile/384MB.jar

echo 'Testing with 4 chunks, 10000 bytes'
node index.js $target -c 4 -s 10000
cmp -n 10000 -bl downloads/test.txt testfile/384MB.jar
