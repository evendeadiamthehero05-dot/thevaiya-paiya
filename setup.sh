#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎭 Who's The Real One? - Development Setup${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed. Please install Node.js 16+ and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version:${NC}"
node --version

# Install backend dependencies
echo -e "\n${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Install frontend dependencies
echo -e "\n${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

echo -e "\n${GREEN}✓ All dependencies installed!${NC}"

# Check if .env exists in backend
if [ ! -f backend/.env ]; then
    echo -e "\n${YELLOW}⚠️  backend/.env not found${NC}"
    echo -e "Create ${YELLOW}backend/.env${NC} with your Firebase credentials:"
    cat << EOF
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
fi

echo -e "\n${BLUE}🚀 Ready to start! Run:${NC}"
echo -e "  ${GREEN}Terminal 1:${NC} cd backend && npm run dev"
echo -e "  ${GREEN}Terminal 2:${NC} cd frontend && npm run dev"
echo -e "\n${BLUE}Then open http://localhost:3000 in your browser${NC}\n"
