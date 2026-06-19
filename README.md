# PAV Healthcare AI

AI-powered healthcare assistant for Douglass Hanly Moir Pathology and Sonic Healthcare.

Built on AWS Bedrock + React + API Gateway + Lambda.

## Architecture

```
React (chat.pavcloud.click)
      ↓ POST /chat
API Gateway HTTP API
      ↓
Lambda (Python 3.12, ARM64)
      ↓
Bedrock Knowledge Base (MSO8IT9YH0)
      ↓
Amazon Nova Lite v1
      ↓
Answer from approved documents
```

## Stack

- **Frontend:** React 18
- **API:** AWS API Gateway HTTP API
- **Backend:** AWS Lambda (Python 3.12, ARM64)
- **AI:** AWS Bedrock — Amazon Nova Lite
- **Knowledge Base:** AWS Bedrock Knowledge Bases + Titan Embeddings
- **Storage:** Amazon S3
- **CDN:** Amazon CloudFront
- **DNS:** Amazon Route 53
- **CI/CD:** GitHub Actions

## Local Development

```bash
cd frontend
npm install
npm start
```

## Deployment

Push to `main` branch triggers GitHub Actions:
1. Install dependencies
2. Build React app
3. Upload to S3
4. Invalidate CloudFront

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `REACT_APP_API_URL` | API Gateway URL |
| `S3_BUCKET_NAME` | S3 bucket for React app |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |

## Environment Variables

```
REACT_APP_API_URL=https://9rmam8jfvi.execute-api.ap-southeast-2.amazonaws.com/prod
```

## Cost Estimate

| Service | Cost |
|---------|------|
| API Gateway | ~$1/M requests |
| Lambda | ~$0 (free tier) |
| Bedrock Nova Lite | ~$0.24/M tokens |
| S3 + CloudFront | ~$0.50/month |
| **Total** | **~$5-10/month** |
