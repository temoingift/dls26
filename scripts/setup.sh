#!/bin/bash
# DLS 2026 Hub - Quick Supabase Setup Script
# Run this after getting your Service Role Key

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "\n${BOLD}================================================${NC}"
echo -e "${BOLD}  DLS 2026 Hub - Supabase Setup${NC}"
echo -e "${BOLD}================================================${NC}\n"

# Check for environment variables
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo -e "${RED}❌ Missing SUPABASE_PROJECT_ID${NC}"
    exit 1
fi

PROJECT_ID="$SUPABASE_PROJECT_ID"
DASHBOARD_URL="https://supabase.com/dashboard/project/$PROJECT_ID"

echo "Project: $BOLD$PROJECT_ID$NC"
echo "Dashboard: $DASHBOARD_URL"
echo ""

# Check for Service Role Key
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY not found${NC}"
    echo ""
    echo "To set it up, run:"
    echo "  1. Get your key from: $DASHBOARD_URL/settings/api"
    echo "  2. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your_key"
    echo "  3. Run: source .env && bash scripts/setup.sh"
    exit 1
fi

echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY found${NC}"
echo ""

# Try using Supabase CLI
echo -e "${BOLD}Applying Migrations...${NC}"
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db push --no-verify && echo -e "${GREEN}✅ Migrations applied${NC}" || echo -e "${YELLOW}⚠️  CLI push failed${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase CLI not available${NC}"
    echo "Use manual setup: See MANUAL_SETUP.md"
fi

echo ""
echo -e "${BOLD}Creating Storage Buckets...${NC}"
echo "This must be done manually:"
echo "  1. Go to: $DASHBOARD_URL/storage/buckets"
echo "  2. Click 'New Bucket' and create:"
echo "     - match-recordings (Private)"
echo "     - avatars (Public)"
echo "     - tournament-covers (Public)"
echo ""

echo -e "${GREEN}✅ Setup script complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify tables: $DASHBOARD_URL/sql"
echo "  2. Create buckets: $DASHBOARD_URL/storage/buckets"
echo "  3. Push to GitHub and deploy to Vercel"
echo ""
