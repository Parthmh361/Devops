/**
 * Organizer-focused minimal test script
 * Run: node organizer-test.js
 */

const BASE_URL = "http://localhost:5000/api";

const timestamp = Date.now();
const ORGANIZER_EMAIL = `organizer-${timestamp}@test.com`;
const SPONSOR_EMAIL = `sponsor-${timestamp}@test.com`;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

const state = {
  organizerToken: null,
  sponsorToken: null,
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
  console.log(`${colors.cyan}Organizer Module Minimal Test${colors.reset}`);

  // 1) Register organizer
  let res = await request("POST", "/auth/register", {
    name: "Organizer User",
    email: ORGANIZER_EMAIL,
    password: "Pass123456",
    role: "organizer",
    organizationName: "Org Inc",
  });
  state.organizerToken = res.data?.data?.token;
  log(res.status === 201 && !!state.organizerToken, "Register organizer", `status=${res.status}`);

  // 2) Register sponsor (for proposal creation)
  res = await request("POST", "/auth/register", {
    name: "Sponsor User",
    email: SPONSOR_EMAIL,
    password: "Pass123456",
    role: "sponsor",
    organizationName: "Sponsor Co",
  });
  state.sponsorToken = res.data?.data?.token;
  log(res.status === 201 && !!state.sponsorToken, "Register sponsor", `status=${res.status}`);

  // 3) Get organizer profile
  res = await request("GET", "/organizer/profile", null, state.organizerToken);
  log(res.status === 200, "Get organizer profile", `status=${res.status}`);

  // 4) Update organizer profile
  res = await request("PUT", "/organizer/profile", {
    name: "Organizer Updated",
    phone: "+1-555-1212",
    website: "https://org.example.com",
    bio: "We host tech events.",
  }, state.organizerToken);
  log(res.status === 200, "Update organizer profile", `status=${res.status}`);

  // 5) Create event
  res = await request("POST", "/events", {
    title: "Organizer Test Event",
    description: "Event created by organizer test",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    eventMode: "online",
  }, state.organizerToken);
  state.eventId = res.data?.data?._id;
  log(res.status === 201 && !!state.eventId, "Create event", `status=${res.status}`);

  // 6) Update sponsorship requirements
  res = await request("PUT", `/events/${state.eventId}/sponsorship-requirements`, {
    tiers: [
      { name: "Gold", amount: 50000, benefits: ["Booth", "Keynote"] },
    ],
    categories: ["Tech"],
    customBenefits: ["Podcast mention"],
  }, state.organizerToken);
  log(res.status === 200, "Update sponsorship requirements", `status=${res.status}`);

  // 7) Publish event
  res = await request("PATCH", `/events/${state.eventId}/publish`, {}, state.organizerToken);
  log(res.status === 200, "Publish event", `status=${res.status}`);

  // 8) Organizer view own events
  res = await request("GET", "/events/my", null, state.organizerToken);
  log(res.status === 200, "Get organizer events", `status=${res.status}`);

  // 9) Sponsor creates proposal
  res = await request("POST", "/proposals", {
    eventId: state.eventId,
    proposedAmount: 25000,
    proposedBenefits: ["Booth"],
    message: "Interested in sponsoring",
  }, state.sponsorToken);
  state.proposalId = res.data?.data?._id;
  log(res.status === 201 && !!state.proposalId, "Create proposal (sponsor)", `status=${res.status}`);

  // 10) Organizer list proposals
  res = await request("GET", "/organizer/proposals", null, state.organizerToken);
  log(res.status === 200, "List organizer proposals", `status=${res.status}`);

  // 11) Organizer accept proposal (creates collaboration)
  res = await request("PATCH", `/proposals/${state.proposalId}/accept`, {}, state.organizerToken);
  log(res.status === 200, "Accept proposal", `status=${res.status}`);
}

run().catch((err) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err.message);
  process.exit(1);
});
