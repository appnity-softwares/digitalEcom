# Production Deployment Checklist

## ✅ Pre-Deployment Security

- [ ] **Install Security Packages**
  ```bash
  cd server
  npm install helmet express-rate-limit
  npm uninstall mongoose
  npm install
  ```

- [ ] **Environment Variables**
  - [ ] Set strong `JWT_SECRET` (min 32 characters)
  - [ ] Set `NODE_ENV=production`
  - [ ] Configure production `DATABASE_URL`
  - [ ] Configure production `FRONTEND_URL`
  - [ ] Add all OAuth callback URLs (production)
  - [ ] Configure R2 credentials
  - [ ] Set Razorpay production keys

- [ ] **Database**
  - [ ] Run migrations: `npx prisma migrate deploy`
  - [ ] Set up automated backups
  - [ ] Configure connection pooling
  - [ ] Add database monitoring

## 🔒 Security Hardening

- [x] Helmet.js configured
- [x] Rate limiting implemented
- [ ] HTTPS/SSL certificates installed
- [ ] Configure reverse proxy (Nginx/Cloudflare)
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable CORS for production domain only
- [ ] Configure CSP headers
- [ ] Set up error monitoring (Sentry)

## 📊 Performance

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up Redis caching
- [ ] Database query optimization
- [ ] Enable HTTP/2
- [ ] Configure image optimization

## 🔐 R2 Configuration

- [ ] Create production R2 bucket
- [ ] Configure CORS (see R2_CORS_SETUP.md)
- [ ] Generate production API tokens
- [ ] Set bucket permissions (private)
- [ ] Configure custom domain (optional)

## 📱 Frontend Build

```bash
cd ecom
npm run build
# Serve dist/ folder via CDN or static hosting
```

## 🚀 Backend Deployment

### Option 1: PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name codestudio-api
pm2 startup
pm2 save
```

### Option 2: Docker
```bash
docker build -t codestudio-api .
docker run -p 5001:5001 --env-file .env codestudio-api
```

### Option 3: Cloud Platform
- **Vercel/Railway**: Connect GitHub repo
- **AWS/GCP**: Use load balancer + auto-scaling
- **Heroku**: `git push heroku main`

## 🧪 Post-Deployment Testing

- [ ] Test health endpoint: `https://api.domain.com/`
- [ ] Test authentication flow
- [ ] Test file uploads (R2)
- [ ] Test payment webhooks
- [ ] Test rate limiting
- [ ] Verify CORS headers
- [ ] Check SSL certificate
- [ ] Monitor error logs

## 📈 Monitoring & Logging

- [ ] Set up application monitoring (New Relic/DataDog)
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure log aggregation (LogDNA/Papertrail)
- [ ] Set up alerts for critical errors
- [ ] Monitor database performance

## 🔄 CI/CD (Optional)

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run build
      - name: Deploy
        run: # Your deployment command
```

## 📝 Documentation

- [ ] Update README with production setup
- [ ] Document environment variables
- [ ] Create deployment runbook
- [ ] Document rollback procedure
- [ ] Create incident response plan

## ⚡ Performance Targets

- [ ] API response time < 200ms (p95)
- [ ] Database query time < 50ms (p95)
- [ ] Frontend load time < 3s (Lighthouse)
- [ ] Time to Interactive < 5s
- [ ] Lighthouse score > 90

## 🛡️ Security Checklist

- [x] No secrets in code
- [x] Environment variables used
- [x] JWT tokens secure
- [x] Password hashing (bcrypt)
- [x] CORS configured
- [x] Rate limiting enabled
- [x] Helmet.js installed
- [ ] SQL injection prevented (Prisma ✓)
- [ ] XSS prevention validated
- [ ] CSRF tokens (if needed)
- [ ] Input sanitization
- [ ] File upload restrictions
- [ ] Secure session management

## 📞 Support & Rollback

### Rollback Plan
```bash
# Quick rollback to previous version
pm2 stop codestudio-api
git checkout <previous-commit>
npm install
npm start
```

### Health Check
```bash
curl https://api.domain.com/
# Should return: {"message": "CodeStudio API is running", ...}
```

## ✅ Final Verification

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificate valid
- [ ] DNS properly configured
- [ ] CDN configured
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team notified
- [ ] Support contacts ready

---

**Remember:** Test thoroughly in staging before production deployment!
