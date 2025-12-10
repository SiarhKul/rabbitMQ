#!/bin/bash

echo "Testing health endpoint at http://localhost:3147/health"
echo "=================================================="
echo ""

# Test full health check
echo "1. Full Health Check (/health):"
echo "-------------------------------"
curl -s http://localhost:3147/health | python -m json.tool 2>/dev/null || curl -s http://localhost:3147/health
echo ""
echo ""

# Test liveness
echo "2. Liveness Probe (/health/liveness):"
echo "-------------------------------------"
curl -s http://localhost:3147/health/liveness | python -m json.tool 2>/dev/null || curl -s http://localhost:3147/health/liveness
echo ""
echo ""

# Test readiness
echo "3. Readiness Probe (/health/readiness):"
echo "---------------------------------------"
curl -s http://localhost:3147/health/readiness | python -m json.tool 2>/dev/null || curl -s http://localhost:3147/health/readiness
echo ""

