if ! command -v aws &> /dev/null
then
    echo "AWS CLI not found installing..."
    pip install awscli
fi

echo "Deployinh to S3..."
aws s3 sync ./dist s3://webbingbucket --delete/
