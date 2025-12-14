# DSG Buy & Sell - Production Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Server hosting (Railway, Render, or VPS)

---

## 1. Database Setup (Neon)

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the connection string:
   ```
   postgresql://user:password@host.neon.tech/database?sslmode=require
   ```

---

## 2. Generate Secure JWT Secret

Run this command to generate a secure 64-character secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**IMPORTANT:** Never commit your JWT secret to version control!

---

## 3. Server Deployment

### Option A: Railway

1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables:
   - `DATABASE_URL` = your Neon connection string
   - `JWT_SECRET` = your generated secret
   - `PORT` = 4000
   - `NODE_ENV` = production
4. Railway auto-deploys on push

### Option B: Render

1. Create a new Web Service
2. Connect to your GitHub repo
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables (same as Railway)

### Option C: VPS (DigitalOcean, etc.)

```bash
# Clone your repo
git clone https://github.com/your-username/dsg-buy-sell.git
cd dsg-buy-sell/server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your production values

# Build
npm run build

# Start with PM2 (recommended)
npm install -g pm2
pm2 start dist/server.js --name dsg-server

# Or use systemd service
```

---

## 4. Database Migration

After setting up the server:

```bash
cd server
npx prisma migrate deploy
```

---

## 5. Client (Mobile App)

### Update API URL

Edit `client/.env`:
```
API_BASE_URL=https://your-production-api.com/api/v1
```

### Build APK/IPA

```bash
cd client

# For Android APK
npx expo build:android
# OR with EAS
npx eas build --platform android

# For iOS
npx eas build --platform ios
```

---

## 6. Security Checklist

- [ ] Strong JWT secret (64+ characters)
- [ ] SSL/HTTPS enabled
- [ ] Database uses SSL (`?sslmode=require`)
- [ ] Environment variables not in code
- [ ] Rate limiting enabled
- [ ] CORS configured for production domains
- [ ] `.env` files in `.gitignore`

---

## Environment Variables Summary

### Server (`/server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | 64+ char random string |
| `PORT` | ✅ | Server port (4000) |
| `NODE_ENV` | ✅ | `production` |

### Client (`/client/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `API_BASE_URL` | ✅ | Backend API URL |
