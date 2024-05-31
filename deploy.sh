echo "Deploying to AWS..."

aws s3 cp ./dist s3://webbingbucket --recursive

