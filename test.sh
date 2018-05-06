target='http://40ff26ef.bwtest-aws.pravala.com/384MB.jar'

echo 'Testing with 1 chunk'
node index.js $target -c 1 -s 10000

echo 'Testing with 2 chunks'
node index.js $target -c 2 -s 10000

echo 'Testing with 4 chunks'
node index.js $target -c 4 -s 10000

echo 'Testing with 8 chunks'
node index.js $target -c 8 -s 10000

echo 'Testing with 16 chunks'
node index.js $target -c 16 -s 10000