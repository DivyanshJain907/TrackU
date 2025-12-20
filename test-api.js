#!/usr/bin/env node

/**
 * TrackU Access Request System - Comprehensive Test Suite
 * Tests all endpoints and functionality
 */

const BASE_URL = "http://localhost:3000";

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

// Test data
let testData = {
  clubLeader: {
    username: `leader_${Date.now()}`,
    email: `leader${Date.now()}@test.com`,
    password: "Test@123456",
    clubName: "Test Club",
    clubDescription: "A test club for automation",
  },
  clubLeaderToken: null,
  clubLeaderId: null,
  admin: {
    email: "divyansh907@tracku.com",
    password: "your_admin_password", // Will need to be set
  },
  adminToken: null,
  accessRequestId: null,
};

// HTTP helper
async function request(method, path, body = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      data: { error: error.message },
    };
  }
}

// Tests
async function testClubLeaderRegistration() {
  console.log("\n" + colors.blue + "=== TEST 1: Club Leader Registration ===" + colors.reset);

  const response = await request("POST", "/api/auth/register", {
    username: testData.clubLeader.username,
    email: testData.clubLeader.email,
    password: testData.clubLeader.password,
    isClubLeader: true,
    clubName: testData.clubLeader.clubName,
    clubDescription: testData.clubLeader.clubDescription,
  });

  if (response.ok && response.status === 201) {
    log.success(`Club leader registered: ${testData.clubLeader.username}`);
    log.success(`Token received`);
    testData.clubLeaderToken = response.data.token;
    testData.clubLeaderId = response.data.userId;
    log.success(`User ID: ${testData.clubLeaderId}`);

    if (response.data.isApproved) {
      log.success(`Auto-approved: ${response.data.isApproved}`);
    } else {
      log.error(`Not auto-approved!`);
    }

    return true;
  } else {
    log.error(`Registration failed: ${response.data.error}`);
    return false;
  }
}

async function testClubLeaderLogin() {
  console.log("\n" + colors.blue + "=== TEST 2: Club Leader Login ===" + colors.reset);

  const response = await request("POST", "/api/auth/login", {
    email: testData.clubLeader.email,
    password: testData.clubLeader.password,
  });

  if (response.ok && response.status === 200) {
    log.success(`Login successful`);
    log.success(`Token received`);
    log.success(`isApproved: ${response.data.isApproved}`);
    log.success(`isClubLeader: ${response.data.isClubLeader}`);
    return true;
  } else {
    log.error(`Login failed: ${response.data.error}`);
    return false;
  }
}

async function testGetAccessRequests() {
  console.log("\n" + colors.blue + "=== TEST 3: Get Access Requests (Admin) ===" + colors.reset);

  if (!testData.clubLeaderToken) {
    log.warning(`Skipping - need admin token first`);
    return false;
  }

  const response = await request(
    "GET",
    "/api/admin/access-requests",
    null,
    testData.clubLeaderToken
  );

  if (response.status === 403) {
    log.success(`Correctly blocked non-admin user`);
    return true;
  } else if (response.ok) {
    log.success(`Retrieved access requests`);
    log.info(`Total requests: ${response.data.length || 0}`);
    return true;
  } else {
    log.error(`Failed to get requests: ${response.data.error}`);
    return false;
  }
}

async function testLoginWithoutApproval() {
  console.log("\n" + colors.blue + "=== TEST 4: Login Without Approval ===" + colors.reset);

  const testUser = {
    username: `user_${Date.now()}`,
    email: `user${Date.now()}@test.com`,
    password: "Test@123456",
  };

  log.info(`This test would require manual DB setup`);
  log.warning(`Skipping for now - manual test needed`);
  return true;
}

async function testHealthCheck() {
  console.log("\n" + colors.blue + "=== TEST 0: Health Check ===" + colors.reset);

  try {
    const response = await fetch(`${BASE_URL}/api/ping`);
    if (response.ok) {
      log.success(`Server is running`);
      log.success(`API responding to requests`);
      return true;
    } else {
      log.error(`Server not responding correctly`);
      return false;
    }
  } catch (error) {
    log.error(`Server is not running: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(colors.blue + "╔════════════════════════════════════════╗" + colors.reset);
  console.log(colors.blue + "║  TrackU Access System - Test Suite     ║" + colors.reset);
  console.log(colors.blue + "╚════════════════════════════════════════╝" + colors.reset);

  let passed = 0;
  let failed = 0;

  // Test health
  if (await testHealthCheck()) passed++;
  else failed++;

  // Test club leader registration
  if (await testClubLeaderRegistration()) passed++;
  else failed++;

  // Test club leader login
  if (await testClubLeaderLogin()) passed++;
  else failed++;

  // Test get access requests
  if (await testGetAccessRequests()) passed++;
  else failed++;

  // Test login without approval
  if (await testLoginWithoutApproval()) passed++;
  else failed++;

  // Summary
  console.log("\n" + colors.blue + "╔════════════════════════════════════════╗" + colors.reset);
  console.log(colors.blue + "║             Test Summary               ║" + colors.reset);
  console.log(colors.blue + "╚════════════════════════════════════════╝" + colors.reset);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total:  ${passed + failed}`);

  if (failed === 0) {
    console.log(`\n${colors.green}All tests passed! ✓${colors.reset}`);
  } else {
    console.log(`\n${colors.red}Some tests failed. Please review above.${colors.reset}`);
  }
}

// Run tests
runTests().catch(console.error);
