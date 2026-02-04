#!/bin/bash

# Security Check Script for Tech Radar
# This script performs comprehensive security checks on the codebase

set -e

echo "==================================="
echo "Tech Radar Security Check"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check for Node.js and npm
echo "1. Checking Node.js environment..."
if ! command_exists node; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo ""

# 2. Run npm audit
echo "2. Running npm audit for dependency vulnerabilities..."
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✓ No moderate or higher vulnerabilities found${NC}"
else
    echo -e "${YELLOW}⚠ Vulnerabilities detected. Run 'npm audit fix' to fix them${NC}"
fi
echo ""

# 3. Check for secrets in code
echo "3. Scanning for potential secrets and sensitive data..."
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "Bearer [A-Za-z0-9\-\._~\+\/]+"
    "[A-Za-z0-9]{32,}"
    "-----BEGIN (RSA|DSA|EC) PRIVATE KEY-----"
)

found_secrets=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -rE "$pattern" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "placeholder" | grep -v "example"; then
        found_secrets=true
    fi
done

if [ "$found_secrets" = true ]; then
    echo -e "${RED}⚠ Potential secrets found in code!${NC}"
else
    echo -e "${GREEN}✓ No obvious secrets detected${NC}"
fi
echo ""

# 4. Check for SQL injection vulnerabilities
echo "4. Checking for potential SQL injection vulnerabilities..."
if grep -rE "(execute|query|raw)\s*\(.*\+.*\)" src/ --exclude-dir=node_modules 2>/dev/null; then
    echo -e "${YELLOW}⚠ Potential SQL injection vulnerability detected${NC}"
    echo "  Use parameterized queries instead of string concatenation"
else
    echo -e "${GREEN}✓ No obvious SQL injection patterns found${NC}"
fi
echo ""

# 5. Check for XSS vulnerabilities
echo "5. Checking for potential XSS vulnerabilities..."
if grep -rE "dangerouslySetInnerHTML|innerHTML\s*=" src/ --exclude-dir=node_modules 2>/dev/null; then
    echo -e "${YELLOW}⚠ Potential XSS vulnerability detected${NC}"
    echo "  Review usage of dangerouslySetInnerHTML and innerHTML"
else
    echo -e "${GREEN}✓ No obvious XSS patterns found${NC}"
fi
echo ""

# 6. Check for insecure random number generation
echo "6. Checking for insecure random number generation..."
if grep -rE "Math\.random\(\)" src/ --exclude-dir=node_modules 2>/dev/null | grep -E "(password|token|key|secret|session)"; then
    echo -e "${YELLOW}⚠ Math.random() used for security-sensitive operations${NC}"
    echo "  Use crypto.randomBytes() or crypto.getRandomValues() instead"
else
    echo -e "${GREEN}✓ No insecure random number generation detected${NC}"
fi
echo ""

# 7. Check for eval usage
echo "7. Checking for dangerous eval() usage..."
if grep -rE "\beval\s*\(" src/ --exclude-dir=node_modules 2>/dev/null; then
    echo -e "${RED}⚠ eval() usage detected - this is dangerous!${NC}"
else
    echo -e "${GREEN}✓ No eval() usage found${NC}"
fi
echo ""

# 8. Check for hardcoded URLs and endpoints
echo "8. Checking for hardcoded sensitive URLs..."
if grep -rE "https?://[a-zA-Z0-9\.\-]+" src/ --exclude-dir=node_modules 2>/dev/null | grep -vE "(localhost|127\.0\.0\.1|example\.com|github\.com|thoughtworks\.com)"; then
    echo -e "${YELLOW}⚠ Hardcoded external URLs found${NC}"
    echo "  Consider using environment variables"
fi
echo ""

# 9. Check environment variable usage
echo "9. Checking for proper environment variable handling..."
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file exists - ensure it's in .gitignore${NC}"
    if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
        echo -e "${RED}ERROR: .env is not in .gitignore!${NC}"
    fi
fi

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓ .env.example file exists${NC}"
fi
echo ""

# 10. Check for missing security headers
echo "10. Checking Next.js security configuration..."
if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
    if grep -q "securityHeaders\|headers:" next.config.* 2>/dev/null; then
        echo -e "${GREEN}✓ Security headers configured${NC}"
    else
        echo -e "${YELLOW}⚠ No security headers found in Next.js config${NC}"
        echo "  Consider adding Content-Security-Policy, X-Frame-Options, etc."
    fi
fi
echo ""

# 11. Check TypeScript for security issues
echo "11. Running TypeScript compiler check..."
if command_exists tsc; then
    if npx tsc --noEmit; then
        echo -e "${GREEN}✓ No TypeScript errors${NC}"
    else
        echo -e "${RED}⚠ TypeScript errors found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ TypeScript not available${NC}"
fi
echo ""

# 12. Check for outdated dependencies
echo "12. Checking for outdated dependencies..."
outdated=$(npm outdated 2>&1 || true)
if [ -n "$outdated" ]; then
    echo -e "${YELLOW}⚠ Outdated dependencies found:${NC}"
    echo "$outdated"
else
    echo -e "${GREEN}✓ All dependencies are up to date${NC}"
fi
echo ""

# Summary
echo "==================================="
echo "Security Check Complete"
echo "==================================="
echo ""
echo "Next steps:"
echo "  1. Review any warnings above"
echo "  2. Run 'npm audit fix' to fix dependency vulnerabilities"
echo "  3. Update outdated dependencies with 'npm update'"
echo "  4. Consider adding security headers to next.config.js"
echo "  5. Enable GitHub's Dependabot for automatic security updates"
echo ""
