target='http://40ff26ef.bwtest-aws.pravala.com/384MB.jar'

echo 'Testing with 1 chunk'
node multiGet.js $target -c 1
diff -s downloads/384MB.jar testfile/384MB.jar

echo 'Testing with 2 chunks'
node multiGet.js $target -c 2
diff -s downloads/384MB.jar testfile/384MB.jar

echo 'Testing with 7 chunks'
node multiGet.js $target -c 7
diff -s downloads/384MB.jar testfile/384MB.jar

echo 'Testing with 1 chunk, 10000 bytes'
node multiGet.js $target -c 1 -s 10000
cmp -n 1000 -bl downloads/384MB.jar testfile/384MB.jar

echo 'Testing with 2 chunks, 10000 bytes'
node multiGet.js $target -c 2 -s 10000
cmp -n 10000 -bl downloads/384MB.jar testfile/384MB.jar

echo 'Testing with 7 chunks, 10000 bytes'
node multiGet.js $target -c 7 -s 10000
cmp -n 10000 -bl downloads/384MB.jar testfile/384MB.jar
