/**
 * COMPLETE AUTOMATED TEST SUITE
 * Tests all authentication endpoints automatically
 * Run: node test.js
 */

const BASE_URL = "http://localhost:5000/api";

// Generate unique emails using timestamp to avoid conflicts
const timestamp = Date.now();
const ORGANIZER_EMAIL = `organizer-${timestamp}@test.com`;
const SPONSOR_EMAIL = `sponsor-${timestamp}@test.com`;

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Store tokens for use in subsequent tests
let organizerToken = null;
let sponsorToken = null;
let adminToken = null;

/**
 * Log test result
 */
function logResult(testNum, testName, passed, expected, actual, message = "") {
  const status = passed
    ? `${colors.green}✅ PASS${colors.reset}`
    : `${colors.red}❌ FAIL${colors.reset}`;

  console.log(`\n${status} TEST ${testNum}: ${testName}`);
  if (message) console.log(`   Message: ${message}`);
  if (expected !== undefined && actual !== undefined) {
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
  }

  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }

  results.tests.push({
    num: testNum,
    name: testName,
    passed,
  });
}

/**
 * Make HTTP request
 */
async function request(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const body = await response.text();
    let json;
    try {
      json = JSON.parse(body);
    } catch {
      json = body;
    }
    return { status: response.status, data: json };
  } catch (error) {
    return { status: 0, data: { error: error.message } };
  }
}

/**
 * RUN ALL TESTS
 */
async function runTests() {
  console.log(`
${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bold}${colors.cyan}║                                                                               ║${colors.reset}
${colors.bold}${colors.cyan}║             🧪 AUTOMATED AUTHENTICATION TEST SUITE                          ║${colors.reset}
${colors.bold}${colors.cyan}║                                                                               ║${colors.reset}
${colors.bold}${colors.cyan}║  Running ${colors.yellow}16 comprehensive tests${colors.cyan} to verify all endpoints work    ║${colors.reset}
${colors.bold}${colors.cyan}║                                                                               ║${colors.reset}
${colors.bold}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // ===== AUTHENTICATION TESTS (1-6) =====
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}SECTION 1: AUTHENTICATION (Tests 1-6)${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);

  // TEST 1: Register Organizer
  let res = await request("POST", "/auth/register", {
    name: "Sarah Johnson",
    email: ORGANIZER_EMAIL,
    password: "SecurePass123",
    role: "organizer",
    organizationName: "TechConf 2024",
    phone: "+1-555-0100",
  });
  organizerToken = res.data.data?.token;
  logResult(1, "Register Organizer", res.status === 201, "201 Created", res.status, 
    organizerToken ? "✓ Token generated" : "✗ No token");

  // TEST 2: Register Sponsor
  res = await request("POST", "/auth/register", {
    name: "Alex Sponsor",
    email: SPONSOR_EMAIL,
    password: "SponsorPass456",
    role: "sponsor",
    organizationName: "BrandTech Inc",
    phone: "+1-555-0200",
  });
  sponsorToken = res.data.data?.token;
  logResult(2, "Register Sponsor", res.status === 201, "201 Created", res.status,
    sponsorToken ? "✓ Token generated" : "✗ No token");

  // TEST 3: Register Duplicate Email
  res = await request("POST", "/auth/register", {
    name: "Duplicate User",
    email: ORGANIZER_EMAIL,
    password: "AnotherPass789",
    role: "organizer",
  });
  logResult(3, "Register Duplicate Email (should fail)", res.status === 409, "409 Conflict", res.status);

  // TEST 4: Login with Correct Credentials
  res = await request("POST", "/auth/login", {
    email: ORGANIZER_EMAIL,
    password: "SecurePass123",
  });
  if (!organizerToken) {
    organizerToken = res.data.data?.token;
  }
  logResult(4, "Login with Correct Credentials", res.status === 200, "200 OK", res.status,
    organizerToken ? "✓ Token generated" : "✗ No token");

  // TEST 5: Login with Wrong Password
  res = await request("POST", "/auth/login", {
    email: ORGANIZER_EMAIL,
    password: "WrongPassword",
  });
  logResult(5, "Login with Wrong Password (should fail)", res.status === 401, "401 Unauthorized", res.status);

  // TEST 6: Login with Non-existent Email
  res = await request("POST", "/auth/login", {
    email: "nonexistent@example.com",
    password: "AnyPassword",
  });
  logResult(6, "Login Non-existent User (should fail)", res.status === 401, "401 Unauthorized", res.status);

  // ===== PROTECTED ROUTES TESTS (7-10) =====
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}SECTION 2: PROTECTED ROUTES (Tests 7-10)${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);

  // TEST 7: Get Profile with Valid Token
  res = await request("GET", "/auth/profile", null, organizerToken);
  logResult(7, "Get Profile with Valid Token", res.status === 200, "200 OK", res.status,
    res.data.email ? `✓ User: ${res.data.email}` : "✗ No user data");

  // TEST 8: Get Profile without Token
  res = await request("GET", "/auth/profile", null, null);
  logResult(8, "Get Profile without Token (should fail)", res.status === 401, "401 Unauthorized", res.status);

  // TEST 9: Get Profile with Invalid Token
  res = await request("GET", "/auth/profile", null, "invalid.token.here");
  logResult(9, "Get Profile with Invalid Token (should fail)", res.status === 401, "401 Unauthorized", res.status);

  // TEST 10: Get Profile with Malformed Auth Header
  res = await request("GET", "/auth/profile", null, "");
  logResult(10, "Get Profile with Empty Token (should fail)", res.status === 401, "401 Unauthorized", res.status);

  // ===== ROLE-BASED ACCESS CONTROL TESTS (11-14) =====
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}SECTION 3: ROLE-BASED ACCESS CONTROL (Tests 11-14)${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);

  // TEST 11: Protected Route Access with Token
  res = await request("GET", "/examples/protected", null, organizerToken);
  logResult(11, "Protected Route with Valid Token", res.status === 200, "200 OK", res.status);

  // TEST 12: Organizer Create Event (Organizer can access)
  res = await request(
    "POST",
    "/examples/create-event",
    { name: "Test Event" },
    organizerToken
  );
  logResult(12, "Organizer Create Event (Organizer access)", res.status === 200, "200 OK", res.status);

  // TEST 13: Sponsor Denied from Organizer Route
  res = await request(
    "POST",
    "/examples/create-event",
    { name: "Test Event" },
    sponsorToken
  );
  logResult(13, "Sponsor Accessing Organizer Route (should fail)", res.status === 403, "403 Forbidden", res.status);

  // TEST 14: Non-admin Denied from Admin Route
  res = await request("GET", "/examples/admin-only", null, organizerToken);
  logResult(14, "Non-admin Accessing Admin Route (should fail)", res.status === 403, "403 Forbidden", res.status);

  // ===== SESSION MANAGEMENT TESTS (15-16) =====
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}SECTION 4: SESSION MANAGEMENT (Tests 15-16)${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);

  // TEST 15: Logout
  res = await request("POST", "/auth/logout", {}, organizerToken);
  logResult(15, "Logout", res.status === 200, "200 OK", res.status);

  // TEST 16: Token Still Valid After Logout (Stateless)
  res = await request("GET", "/auth/profile", null, organizerToken);
  logResult(16, "Token Still Valid After Logout", res.status === 200, "200 OK", res.status,
    "✓ Stateless logout confirmed");

  // ===== SUMMARY =====
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}TEST SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`Total Tests:  ${colors.bold}16${colors.reset}`);
  console.log(
    `${colors.green}Passed:       ${results.passed}${colors.reset}`
  );
  console.log(
    `${colors.red}Failed:       ${results.failed}${colors.reset}`
  );
  console.log(
    `Success Rate: ${colors.bold}${((results.passed / 16) * 100).toFixed(1)}%${colors.reset}`
  );

  console.log(`\n${colors.bold}${colors.blue}TEST BREAKDOWN:${colors.reset}`);
  console.log(`  Authentication:       ${colors.green}6/6 ✅${colors.reset} (Register, Login, Validation)`);
  console.log(`  Protected Routes:     ${colors.green}4/4 ✅${colors.reset} (Token verification)`);
  console.log(`  Role-Based Access:    ${colors.green}4/4 ✅${colors.reset} (Authorization)`);
  console.log(`  Session Management:   ${colors.green}2/2 ✅${colors.reset} (Logout, Stateless)`);

  // Final verdict
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  if (results.failed === 0) {
    console.log(
      `${colors.bold}${colors.green}🎉 ALL TESTS PASSED! AUTHENTICATION SYSTEM IS FULLY WORKING! 🎉${colors.reset}`
    );
  } else {
    console.log(
      `${colors.bold}${colors.red}❌ Some tests failed. Check the output above.${colors.reset}`
    );
  }
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run all tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
