# Cloudflare R2 CORS Configuration

When setting up your Cloudflare R2 bucket, you need to configure CORS (Cross-Origin Resource Sharing) to allow your frontend application to upload files directly.

## Steps to Configure CORS

1. **Open Cloudflare Dashboard**
   - Navigate to R2 section
   - Select your bucket (e.g., `codestudio-uploads`)

2. **Go to Settings Tab**
   - Click on "CORS Policy"

3. **Add CORS Rule**
   
   Click "Add CORS Rule" and paste the following configuration:

   ```json
   {
     "AllowedOrigins": [
       "http://localhost:5173",
       "https://yourdomain.com"
     ],
     "AllowedMethods": [
       "GET",
       "PUT",
       "DELETE"
     ],
     "AllowedHeaders": [
       "*"
     ],
     "ExposeHeaders": [
       "ETag"
     ],
     "MaxAgeSeconds": 3600
   }
   ```

4. **Save Configuration**

## CORS Rule Explanation

- **AllowedOrigins**: URLs that can access the bucket
  - `http://localhost:5173` - Development frontend
  - `https://yourdomain.com` - Production frontend
  - Add all domains that need access

- **AllowedMethods**: 
  - `GET` - For viewing files via signed URLs
  - `PUT` - For uploading files via presigned URLs
  - `DELETE` - For deleting files

- **AllowedHeaders**: `*` allows all headers (including Content-Type)

- **ExposeHeaders**: `ETag` exposed for upload verification

- **MaxAgeSeconds**: Browser caches preflight response for 1 hour

## Testing CORS

After configuring CORS, test by:

1. Opening browser console
2. Navigating to `/r2-upload-demo`
3. Uploading a file
4. No CORS errors should appear in console

## Common Issues

### "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution:** Add your frontend URL to AllowedOrigins

### "Method PUT is not allowed by Access-Control-Allow-Methods"
**Solution:** Ensure PUT is in AllowedMethods

### CORS errors in production but not development
**Solution:** Add production domain to AllowedOrigins
