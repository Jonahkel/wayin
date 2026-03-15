#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Running all test files...${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if dev server is running
if ! curl -s http://localhost:3000/api/search > /dev/null 2>&1; then
  echo -e "${RED}⚠ Error: Dev server doesn't appear to be running on localhost:3000${NC}"
  echo -e "${YELLOW}Start it with: npm run dev${NC}\n"
  exit 1
fi

# Counter for pass/fail
total_tests=0
failed_tests=0

# Find all test files in the tests directory
for test_file in tests/test-*.ts tests/test-*.js; do
  # Check if file exists (in case no matches found)
  if [ -f "$test_file" ]; then
    total_tests=$((total_tests + 1))
    echo -e "${YELLOW}Running: $test_file${NC}"
    
    # Run the test file and capture both output and exit code
    if [[ "$test_file" == *.ts ]]; then
      # Use tsx for TypeScript files
      output=$(npx tsx "$test_file" 2>&1)
    else
      # Use node for JavaScript files
      output=$(node "$test_file" 2>&1)
    fi
    
    test_exit=$?
    echo "$output"
    
    # Check if output contains any failures (✗)
    if echo "$output" | grep -q "✗"; then
      echo -e "${RED}✗ Tests Failed${NC}\n"
      failed_tests=$((failed_tests + 1))
    elif [ $test_exit -eq 0 ]; then
      echo -e "${GREEN}✓ All Tests Passed${NC}\n"
    else
      echo -e "${RED}✗ Script Failed${NC}\n"
      failed_tests=$((failed_tests + 1))
    fi
  fi
done

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "Total test files: $total_tests"
if [ $failed_tests -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Failed test files: $failed_tests${NC}"
  exit 1
fi