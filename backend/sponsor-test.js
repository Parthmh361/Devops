/**
 * Sponsor-focused minimal test script
 * Run: node sponsor-test.js
 */

const BASE_URL = "http://localhost:5000/api";

const timestamp = Date.now();
const SPONSOR_EMAIL = `sponsor-${timestamp}@test.com`;
const ORGANIZER_EMAIL = `organizer-${timestamp}@test.com`;
const ADMIN_EMAIL = `admin-${timestamp}@test.com`;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

const state = {
  sponsorToken: null,
  organizerToken: null,
  adminToken: null,
  eventId: null,
  proposalId: null,
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
  console.log(`${colors.cyan}Sponsor Module Minimal Test${colors.reset}`);

  // 1) Register sponsor
  let res = await request("POST", "/auth/register", {
    name: "Sponsor User",
    email: SPONSOR_EMAIL,
    password: "Pass123456",
    role: "sponsor",
    organizationName: "Sponsor Co",
  });
  state.sponsorToken = res.data?.data?.token;
  log(res.status === 201 && !!state.sponsorToken, "Register sponsor", `status=${res.status}`);

  // 2) Register organizer (to create event)
  res = await request("POST", "/auth/register", {
    name: "Organizer User",
    email: ORGANIZER_EMAIL,
    password: "Pass123456",
    role: "organizer",
    organizationName: "Org Inc",
  });
  state.organizerToken = res.data?.data?.token;
  log(res.status === 201 && !!state.organizerToken, "Register organizer", `status=${res.status}`);

  // 3) Register admin (to approve event)
  res = await request("POST", "/auth/register", {
    name: "Admin User",
    email: ADMIN_EMAIL,
    password: "Pass123456",
    role: "admin",
    organizationName: "Admin Org",
  });
  state.adminToken = res.data?.data?.token;
  log(res.status === 201 && !!state.adminToken, "Register admin", `status=${res.status}`);

  // 4) Organizer creates event
  res = await request("POST", "/events", {
    title: "Sponsor Test Event",
    description: "Event created for sponsor testing",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    eventMode: "online",
    sponsorshipNeeds: {
      tiers: [{ name: "Gold", amount: 30000, benefits: ["Booth"] }],
      categories: ["Tech"],
      customBenefits: ["Newsletter mention"],
    },
  }, state.organizerToken);
  state.eventId = res.data?.data?._id;
  log(res.status === 201 && !!state.eventId, "Organizer creates event", `status=${res.status}`);

  // 5) Organizer publishes event
  res = await request("PATCH", `/events/${state.eventId}/publish`, {}, state.organizerToken);
  log(res.status === 200, "Publish event", `status=${res.status}`);

  // 6) Admin approves event
  res = await request("POST", `/events/${state.eventId}/approve`, { isApproved: true }, state.adminToken);
  log(res.status === 200, "Approve event", `status=${res.status}`);

  // 7) Sponsor discovers events
  res = await request("GET", "/events?search=Sponsor%20Test&page=1&limit=5");
  log(res.status === 200, "Event discovery", `status=${res.status}`);

  // 8) Sponsor submits proposal
  res = await request("POST", "/proposals", {
    eventId: state.eventId,
    proposedAmount: 15000,
    proposedBenefits: ["Booth"],
    message: "Interested in sponsoring",
  }, state.sponsorToken);
  state.proposalId = res.data?.data?._id;
  log(res.status === 201 && !!state.proposalId, "Submit proposal", `status=${res.status}`);

  // 9) Sponsor dashboard
  res = await request("GET", `/sponsor/proposals?status=pending&eventId=${state.eventId}`, null, state.sponsorToken);
  log(res.status === 200, "Sponsor proposals dashboard", `status=${res.status}`);

  // 10) Invalid proposal amount (should fail)
  res = await request("POST", "/proposals", {
    eventId: state.eventId,
    proposedAmount: 0,
  }, state.sponsorToken);
  log(res.status === 400, "Reject invalid amount", `status=${res.status}`);
}

run().catch((err) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err.message);
  process.exit(1);
});
