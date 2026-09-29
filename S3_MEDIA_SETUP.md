# S3 + CloudFront media (production)

All new uploads go to **S3** when `USE_S3_MEDIA=true`. The API returns a **CloudFront URL** stored in MongoDB. The frontend loads media from `NEXT_PUBLIC_MEDIA_URL` (CloudFront domain).

## Backend (`backend/.env`)

```env
USE_S3_MEDIA=true
AWS_REGION=ap-south-1
AWS_S3_BUCKET=leiraindia-media-prod
AWS_CLOUDFRONT_URL=https://media.leiraindia.com

# Optional — EC2 IAM role is preferred (no keys on disk)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
```

## Frontend (`.env` / Vercel / hosting)

```env
NEXT_PUBLIC_MEDIA_URL=https://media.leiraindia.com
NEXT_PUBLIC_API_URL=https://api.leiraindia.com/api
```

## S3 folder layout (Leira)

| Type | S3 key | Example URL |
|------|--------|-------------|
| Product / blog images | `products/{productKey}/file.webp` | `https://media.leiraindia.com/products/jasmine/leira-....webp` |
| Home videos | `videos/file.mp4` | `https://media.leiraindia.com/videos/clip-123.mp4` |

## EC2 cutover (one time)

### 1. Copy existing files to S3

```bash
aws s3 cp /var/www/leira/backend/uploads/products s3://leiraindia-media-prod/products --recursive
aws s3 cp /var/www/leira/backend/uploads/videos s3://leiraindia-media-prod/videos --recursive
```

Or from the repo on the server:

```bash
cd backend
npm run sync-uploads-to-s3
```

### 2. Update database URLs

Dry run:

```bash
DRY_RUN=true AWS_CLOUDFRONT_URL=https://media.leiraindia.com npm run migrate-media-urls
```

Live:

```bash
AWS_CLOUDFRONT_URL=https://media.leiraindia.com npm run migrate-media-urls
```

### 3. Enable S3 on backend + redeploy

Set env vars, `npm install`, restart PM2/systemd.

### 4. Deploy frontend with `NEXT_PUBLIC_MEDIA_URL`

### 5. Test

- Upload a new product image → URL should be `https://media.../products/...`
- Open shop, blog cover, home video
- Old products should still load (after DB migration)

### 6. Remove local uploads from EC2 (after sync + migrate + site test)

```bash
cd /var/www/leira/backend   # apna path

# backup pehle (recommended)
mv uploads uploads_backup_$(date +%Y%m%d)

# site test karo 1-2 din — sab images/videos sahi?

# phir backup delete
# rm -rf uploads_backup_YYYYMMDD
```

With `USE_S3_MEDIA=true`, the backend no longer serves `/uploads` from disk.

## IAM policy (EC2 role)

The instance role needs at least:

- `s3:PutObject`, `s3:GetObject`, `s3:HeadObject` on `arn:aws:s3:::YOUR-BUCKET/*`

## Local development

Leave `USE_S3_MEDIA` unset or `false` — files save under `backend/uploads/` as before.
