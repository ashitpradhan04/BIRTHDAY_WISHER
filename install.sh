#!/usr/bin/env bash
# install.sh — one-shot dependency installer for Birthday Wisher Enterprise
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "  🎂 Birthday Wisher Enterprise — Dependency Installer"
echo "  ====================================================="
echo ""

# --- Check prerequisites ---
command -v java  >/dev/null 2>&1 || error "Java 17+ is required. Install from https://adoptium.net"
command -v mvn   >/dev/null 2>&1 || error "Maven 3.8+ is required. Install from https://maven.apache.org/download.cgi"
command -v node  >/dev/null 2>&1 || error "Node.js 18+ is required. Install from https://nodejs.org"
command -v npm   >/dev/null 2>&1 || error "npm is required (comes with Node.js)"

JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
NODE_VER=$(node --version | cut -c2- | cut -d'.' -f1)

[[ "$JAVA_VER" -ge 17 ]] || error "Java 17+ required (found Java $JAVA_VER)"
[[ "$NODE_VER" -ge 18 ]] || error "Node 18+ required (found Node $NODE_VER)"

info "Java $JAVA_VER detected"
info "Node $NODE_VER detected"
echo ""

# --- Backend dependencies ---
echo "📦 Downloading backend Maven dependencies..."
cd "$SCRIPT_DIR/backend"
mvn dependency:resolve -q && info "Backend dependencies downloaded (~150MB in ~/.m2/repository)"
echo ""

# --- Frontend dependencies ---
echo "📦 Installing frontend npm packages..."
cd "$SCRIPT_DIR/frontend"
npm install && info "Frontend packages installed (node_modules/)"
echo ""

# --- Done ---
echo "  ✅ All dependencies installed!"
echo ""
echo "  To start the app:"
echo "    Backend:  cd backend && mvn spring-boot:run"
echo "    Frontend: cd frontend && npx ng serve"
echo ""
echo "  Or with Docker (no Java/Node needed):"
echo "    docker-compose up --build"
echo ""
