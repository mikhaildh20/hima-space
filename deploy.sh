#!/bin/bash
# HIMA Space Deployment Script
# Usage: ./deploy.sh [environment] [commit_sha]
# Example: ./deploy.sh production abc1234

set -e

ENV="${1:-production}"
SHA="${2:-}"
DEPLOY_DIR="/opt/projects/hima-space"
REPO_URL="git@github.com:mikhaildh20/hima-space.git"
LOG_FILE="/var/log/hima-space/deploy.log"
APP_NAME="hima-space"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 HIMA Space Deployment Started${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Environment: ${GREEN}$ENV${NC}"
echo -e "  Commit SHA:  ${GREEN}$SHA${NC}"
echo -e "  Time:        ${GREEN}$(date)${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create log directory if not exists
mkdir -p /var/log/hima-space

# Function to log
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] $message" | tee -a $LOG_FILE
}

# Function to run deploy steps
deploy() {
    log "🔄 Step 1: Pulling latest code from git..."

    if [ ! -d "$DEPLOY_DIR/.git" ]; then
        log "📦 Cloning repository..."
        git clone $REPO_URL $DEPLOY_DIR
    else
        cd $DEPLOY_DIR
        git fetch origin
        git reset --hard origin/master
        if [ -n "$SHA" ]; then
            git checkout $SHA 2>/dev/null || git checkout master
        fi
    fi

    log "✅ Code updated successfully"

    log "🔄 Step 2: Installing dependencies..."
    cd $DEPLOY_DIR
    npm ci

    log "🔄 Step 3: Generating Prisma Client..."
    npx prisma generate

    log "🔄 Step 4: Running database migrations..."
    npx prisma migrate deploy

    log "🔄 Step 5: Building application..."
    npm run build

    log "🔄 Step 6: Setting up PM2 ecosystem..."
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        log "♻️  Restarting existing PM2 process..."
        pm2 restart $APP_NAME
    else
        log "🆕 Starting new PM2 process..."
        pm2 start ecosystem.config.js
    fi

    log "🔄 Step 7: Reloading Nginx..."
    sudo nginx -t 2>/dev/null && sudo systemctl reload nginx || log "⚠️  Nginx reload skipped"

    log "✅ Deployment completed successfully!"

    # Health check
    log "🔄 Step 8: Running health check..."
    sleep 3
    if curl -s http://localhost:4000/api/health | grep -q "healthy"; then
        log "✅ Health check passed!"
    else
        log "⚠️  Health check failed - please verify manually"
    fi

    echo ""
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "  App URL:   https://himaspace.karsa-dev.my.id"
    echo -e "  PM2 Status: ${GREEN}$(pm2 show $APP_NAME 2>/dev/null | grep status || echo 'unknown')${NC}"
    echo -e "  Logs:      tail -f $LOG_FILE"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Execute deployment
deploy

# Cleanup old backups (keep last 5)
if [ -d "$DEPLOY_DIR/backups" ]; then
    log "🔄 Cleaning up old backups..."
    cd "$DEPLOY_DIR/backups"
    ls -t | tail -n +6 | xargs -r rm -rf
fi

log "🎯 Deployment process completed at $(date)"
