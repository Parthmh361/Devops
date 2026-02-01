#!/usr/bin/env node

/**
 * Admin Panel API Test Script
 * Tests user management, event moderation, and analytics endpoints
 * Run: node admin-test.js
 */

const BASE_URL = "http://localhost:5000/api";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

const state = {
  adminToken: null,
  organizerToken: null,
  sponsorToken: null,
  organizerId: null,
  sponsorId: null,
  eventId: null,
};

function log(pass, label, detail = "") {
  const status = pass ? `${colors.green}PASS` : `${colors.red}FAIL`;
  console.log(`${status}${colors.reset} ${label}${detail ? ` - ${detail}` : ""}`);
}

async function request(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, data: json };
}

async function run() {
  console.log(`${colors.cyan}🔧 Admin Panel API Test Suite${colors.reset}\n`);

  const timestamp = Date.now();

  // ===== SETUP =====
  console.log(`${colors.yellow}[SETUP] Creating test users and data...${colors.reset}\n`);

  // 1) Register admin
  let res = await request("POST", "/auth/register", {
    name: "Admin User",
    email: `admin-${timestamp}@test.com`,
    password: "Admin123456",
    role: "admin",
  });
  state.adminToken = res.data?.data?.token;
  log(res.status === 201 && !!state.adminToken, "1. Register admin", `status=${res.status}`);

  // 2) Register organizer
  res = await request("POST", "/auth/register", {
    name: "Test Organizer",
    email: `organizer-${timestamp}@test.com`,
    password: "Pass123456",
    role: "organizer",
    organizationName: "Test Events Co",
  });
  state.organizerToken = res.data?.data?.token;
  state.organizerId = res.data?.data?.user?._id;
  log(res.status === 201 && !!state.organizerToken, "2. Register organizer", `status=${res.status}`);

  // 3) Register sponsor
  res = await request("POST", "/auth/register", {
    name: "Test Sponsor",
    email: `sponsor-${timestamp}@test.com`,
    password: "Pass123456",
    role: "sponsor",
    organizationName: "Sponsor Corp",
  });
  state.sponsorToken = res.data?.data?.token;
  state.sponsorId = res.data?.data?.user?._id;
  log(res.status === 201 && !!state.sponsorToken, "3. Register sponsor", `status=${res.status}`);

  // 4) Create test event
  res = await request("POST", "/events", {
    title: "Admin Test Event",
    description: "Event for testing admin moderation",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    eventMode: "online",
    sponsorshipNeeds: {
      tiers: [{ name: "Gold", amount: 25000, benefits: ["Logo on website"] }],
      categories: ["Technology"],
      customBenefits: ["Social media promotion"],
    },
  }, state.organizerToken);
  state.eventId = res.data?.data?._id;
  log(res.status === 201 && !!state.eventId, "4. Create event", `status=${res.status}`);

  // 5) Publish event
  res = await request("PATCH", `/events/${state.eventId}/publish`, {}, state.organizerToken);
  log(res.status === 200, "5. Publish event", `status=${res.status}`);

  console.log(`\n${colors.yellow}[TESTS] Testing Admin APIs...${colors.reset}\n`);

  // ===== USER MANAGEMENT TESTS =====
  console.log(`${colors.cyan}👥 User Management Tests${colors.reset}`);

  // 6) Get all users
  res = await request("GET", "/admin/users?page=1&limit=10", null, state.adminToken);
  const usersCount = res.data?.data?.length || 0;
  log(res.status === 200 && usersCount >= 3, "6. Get all users", `status=${res.status}, count=${usersCount}`);

  // 7) Filter users by role
  res = await request("GET", "/admin/users?role=organizer", null, state.adminToken);
  const organizersCount = res.data?.data?.length || 0;
  log(res.status === 200 && organizersCount >= 1, "7. Filter users by role", `status=${res.status}, organizers=${organizersCount}`);

  // 8) Search users
  res = await request("GET", `/admin/users?search=Test`, null, state.adminToken);
  log(res.status === 200, "8. Search users", `status=${res.status}`);

  // 9) Get single user
  res = await request("GET", `/admin/users/${state.sponsorId}`, null, state.adminToken);
  log(res.status === 200 && res.data?.data?._id === state.sponsorId, "9. Get user by ID", `status=${res.status}`);

  // 10) Deactivate user
  res = await request("PATCH", `/admin/users/${state.sponsorId}/status`, { isActive: false }, state.adminToken);
  const deactivateSuccess = res.status === 200 && res.data?.data?.isActive === false;
  log(deactivateSuccess, "10. Deactivate user", `status=${res.status}`);

  // 11) Reactivate user
  res = await request("PATCH", `/admin/users/${state.sponsorId}/status`, { isActive: true }, state.adminToken);
  const reactivateSuccess = res.status === 200 && res.data?.data?.isActive === true;
  log(reactivateSuccess, "11. Reactivate user", `status=${res.status}`);

  // 12) Cannot modify self
  res = await request("GET", "/admin/users?role=admin", null, state.adminToken);
  const adminId = res.data?.data?.[0]?._id;
  res = await request("PATCH", `/admin/users/${adminId}/status`, { isActive: false }, state.adminToken);
  log(res.status === 403, "12. Cannot modify self status", `status=${res.status}`);

  // 13) Delete user (soft delete)
  res = await request("DELETE", `/admin/users/${state.sponsorId}`, null, state.adminToken);
  log(res.status === 200, "13. Delete user (soft)", `status=${res.status}`);

  // 14) Cannot delete admin
  res = await request("DELETE", `/admin/users/${adminId}`, null, state.adminToken);
  log(res.status === 403, "14. Cannot delete admin", `status=${res.status}`);

  // ===== EVENT MODERATION TESTS =====
  console.log(`\n${colors.cyan}🎉 Event Moderation Tests${colors.reset}`);

  // 15) Get all events
  res = await request("GET", "/admin/events?page=1&limit=10", null, state.adminToken);
  const eventsCount = res.data?.data?.length || 0;
  log(res.status === 200 && eventsCount >= 1, "15. Get all events", `status=${res.status}, count=${eventsCount}`);

  // 16) Filter by status
  res = await request("GET", "/admin/events?status=published", null, state.adminToken);
  log(res.status === 200, "16. Filter events by status", `status=${res.status}`);

  // 17) Filter by approval
  res = await request("GET", "/admin/events?isApproved=false", null, state.adminToken);
  const unapprovedCount = res.data?.data?.length || 0;
  log(res.status === 200, "17. Filter unapproved events", `status=${res.status}, count=${unapprovedCount}`);

  // 18) Approve event
  res = await request("PATCH", `/admin/events/${state.eventId}/approve`, {}, state.adminToken);
  const approveSuccess = res.status === 200 && res.data?.data?.isApproved === true;
  log(approveSuccess, "18. Approve event", `status=${res.status}`);

  // 19) Cannot approve already approved
  res = await request("PATCH", `/admin/events/${state.eventId}/approve`, {}, state.adminToken);
  log(res.status === 400, "19. Cannot re-approve event", `status=${res.status}`);

  // 20) Create second event for rejection test
  res = await request("POST", "/events", {
    title: "Event to Reject",
    description: "This event will be rejected",
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    eventMode: "offline",
    sponsorshipNeeds: {
      tiers: [{ name: "Silver", amount: 10000, benefits: ["Booth"] }],
      categories: ["Business"],
      customBenefits: [],
    },
  }, state.organizerToken);
  const rejectEventId = res.data?.data?._id;
  log(res.status === 201, "20. Create event for rejection", `status=${res.status}`);

  // 21) Publish second event
  res = await request("PATCH", `/events/${rejectEventId}/publish`, {}, state.organizerToken);
  log(res.status === 200, "21. Publish second event", `status=${res.status}`);

  // 22) Reject event with reason
  res = await request("PATCH", `/admin/events/${rejectEventId}/reject`, {
    reason: "Event description needs more details",
  }, state.adminToken);
  const rejectSuccess = res.status === 200 && res.data?.data?.event?.status === "draft";
  log(rejectSuccess, "22. Reject event with reason", `status=${res.status}`);

  // 23) Reject without reason fails
  res = await request("PATCH", `/admin/events/${state.eventId}/reject`, {}, state.adminToken);
  log(res.status === 400, "23. Reject without reason fails", `status=${res.status}`);

  // ===== ANALYTICS TESTS =====
  console.log(`\n${colors.cyan}📊 Analytics Tests${colors.reset}`);

  // 24) Get overview
  res = await request("GET", "/admin/analytics/overview", null, state.adminToken);
  const hasUsers = res.data?.data?.users?.total > 0;
  const hasEvents = res.data?.data?.events?.total > 0;
  log(res.status === 200 && hasUsers && hasEvents, "24. Get analytics overview", `status=${res.status}`);
  if (res.status === 200) {
    console.log(`   Users: ${res.data?.data?.users?.total}, Events: ${res.data?.data?.events?.total}`);
  }

  // 25) Get trends
  res = await request("GET", "/admin/analytics/trends", null, state.adminToken);
  const hasTrends = res.data?.data?.userTrends?.length >= 0;
  log(res.status === 200 && hasTrends, "25. Get analytics trends", `status=${res.status}`);
  if (res.status === 200) {
    console.log(`   Months tracked: ${res.data?.data?.userTrends?.length}`);
  }

  // ===== AUTHORIZATION TESTS =====
  console.log(`\n${colors.cyan}🔒 Authorization Tests${colors.reset}`);

  // 26) Non-admin cannot access user management
  res = await request("GET", "/admin/users", null, state.organizerToken);
  log(res.status === 403, "26. Non-admin blocked from users", `status=${res.status}`);

  // 27) Non-admin cannot access event moderation
  res = await request("GET", "/admin/events", null, state.sponsorToken);
  log(res.status === 403, "27. Non-admin blocked from events", `status=${res.status}`);

  // 28) Non-admin cannot access analytics
  res = await request("GET", "/admin/analytics/overview", null, state.organizerToken);
  log(res.status === 403, "28. Non-admin blocked from analytics", `status=${res.status}`);

  // 29) No token returns 401
  res = await request("GET", "/admin/users", null, null);
  log(res.status === 401, "29. No token returns 401", `status=${res.status}`);

  console.log(`\n${colors.cyan}${"=".repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✅ All admin panel tests completed!${colors.reset}`);
  console.log(`${colors.cyan}${"=".repeat(60)}${colors.reset}`);
}

run().catch((err) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err.message);
  process.exit(1);
});
