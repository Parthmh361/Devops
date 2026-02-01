#!/usr/bin/env node

/**
 * Collaboration & Communication Features Test Script
 * Tests: State machine, messaging, document upload/download
 * Run: node collaboration-test.js
 */

const BASE_URL = "http://localhost:5000/api";

const timestamp = Date.now();
const ORGANIZER_EMAIL = `organizer-${timestamp}@test.com`;
const SPONSOR_EMAIL = `sponsor-${timestamp}@test.com`;
const ADMIN_EMAIL = `admin-${timestamp}@test.com`;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

const state = {
  organizerToken: null,
  sponsorToken: null,
  adminToken: null,
  eventId: null,
  proposalId: null,
  collaborationId: null,
  messageId: null,
  documentId: null,
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

async function uploadFile(endpoint, filePath, documentType = "other", token = null) {
  const fs = require("fs");
  const path = require("path");
  const os = require("os");
  const http = require("http");

  // Create a simple test PDF content
  const testPdfContent = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj xref 0 4 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n trailer<</Size 4/Root 1 0 R>>startxref 194 %%EOF"
  );

  // Create temporary file (cross-platform)
  const tempFile = path.join(os.tmpdir(), "test_document.pdf");
  fs.writeFileSync(tempFile, testPdfContent);

  return new Promise((resolve, reject) => {
    const FormData = require("form-data");
    const formData = new FormData();
    
    formData.append("file", fs.createReadStream(tempFile), {
      filename: "test_document.pdf",
      contentType: "application/pdf",
    });
    formData.append("documentType", documentType);

    const headers = formData.getHeaders();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(
      `${BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers: headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            fs.unlinkSync(tempFile);
          } catch (e) {
            // ignore
          }
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json });
          } catch (err) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      }
    );

    req.on("error", (err) => {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // ignore
      }
      reject(err);
    });

    formData.pipe(req);
  });
}

async function run() {
  console.log(`${colors.cyan}🧪 Collaboration & Communication Test Suite${colors.reset}\n`);

  // ===== SETUP: Register users and create collaboration =====
  console.log(`${colors.yellow}[SETUP] Registering users and creating collaboration...${colors.reset}\n`);

  // 1) Register organizer
  let res = await request("POST", "/auth/register", {
    name: "Event Organizer",
    email: ORGANIZER_EMAIL,
    password: "Pass123456",
    role: "organizer",
    organizationName: "Event Org",
  });
  state.organizerToken = res.data?.data?.token;
  log(res.status === 201 && !!state.organizerToken, "1. Register organizer", `status=${res.status}`);

  // 2) Register sponsor
  res = await request("POST", "/auth/register", {
    name: "Sponsor User",
    email: SPONSOR_EMAIL,
    password: "Pass123456",
    role: "sponsor",
    organizationName: "Sponsor Inc",
  });
  state.sponsorToken = res.data?.data?.token;
  log(res.status === 201 && !!state.sponsorToken, "2. Register sponsor", `status=${res.status}`);

  // 3) Register admin
  res = await request("POST", "/auth/register", {
    name: "Admin User",
    email: ADMIN_EMAIL,
    password: "Pass123456",
    role: "admin",
    organizationName: "Admin Org",
  });
  state.adminToken = res.data?.data?.token;
  log(res.status === 201 && !!state.adminToken, "3. Register admin", `status=${res.status}`);

  // 4) Create event
  res = await request("POST", "/events", {
    title: "Collaboration Test Event",
    description: "Event for testing collaboration features",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    eventMode: "hybrid",
    sponsorshipNeeds: {
      tiers: [{ name: "Platinum", amount: 50000, benefits: ["Booth", "Speaking slot"] }],
      categories: ["Technology"],
      customBenefits: ["Logo placement"],
    },
  }, state.organizerToken);
  state.eventId = res.data?.data?._id;
  log(res.status === 201 && !!state.eventId, "4. Create event", `status=${res.status}`);

  // 5) Publish event
  res = await request("PATCH", `/events/${state.eventId}/publish`, {}, state.organizerToken);
  log(res.status === 200, "5. Publish event", `status=${res.status}`);

  // 6) Approve event
  res = await request("POST", `/events/${state.eventId}/approve`, { isApproved: true }, state.adminToken);
  log(res.status === 200, "6. Approve event", `status=${res.status}`);

  // 7) Submit proposal
  res = await request("POST", "/proposals", {
    eventId: state.eventId,
    proposedAmount: 25000,
    proposedBenefits: ["Booth"],
    message: "Interested in sponsoring this event",
  }, state.sponsorToken);
  state.proposalId = res.data?.data?._id;
  log(res.status === 201 && !!state.proposalId, "7. Submit proposal", `status=${res.status}`);

  // 8) Accept proposal (auto-creates collaboration as pending)
  res = await request("PATCH", `/proposals/${state.proposalId}/accept`, {}, state.organizerToken);
  // Extract collaboration ID from response
  state.collaborationId = res.data?.data?.collaboration;
  log(res.status === 200 && !!state.collaborationId, "8. Accept proposal (auto-creates collab)", `status=${res.status}, collabId=${state.collaborationId}`);

  console.log(`\n${colors.yellow}[TESTS] Running collaboration features...${colors.reset}\n`);

  // ===== TEST 1: Collaboration State Machine =====
  console.log(`${colors.cyan}📋 Collaboration State Machine Tests${colors.reset}`);

  // 9) Activate collaboration
  res = await request("PATCH", `/collaborations/${state.collaborationId}/activate`, {}, state.organizerToken);
  const activateSuccess = res.status === 200 && res.data?.data?.status === "active";
  log(activateSuccess, "9. Activate collaboration (pending→active)", `status=${res.status}`);
  if (res.status === 404) console.log(`   Response: ${JSON.stringify(res.data)}`);

  // 10) Try to activate again (should fail - already active)
  res = await request("PATCH", `/collaborations/${state.collaborationId}/activate`, {}, state.organizerToken);
  log(res.status === 400, "10. Activate fails when already active", `status=${res.status}`);
  if (res.status === 404) console.log(`   Response: ${JSON.stringify(res.data)}`);

  // 11) Sponsor tries to activate (should fail - organizer only)
  res = await request("PATCH", `/collaborations/${state.collaborationId}/activate`, {}, state.sponsorToken);
  log(res.status === 403, "11. Activate fails for non-organizer", `status=${res.status}`);

  // ===== TEST 2: Messaging =====
  console.log(`\n${colors.cyan}💬 Messaging Tests${colors.reset}`);

  // 12) Send message as organizer
  res = await request("POST", `/messages/${state.collaborationId}`, {
    content: "Great! Let's start the sponsorship. Looking forward to your partnership.",
  }, state.organizerToken);
  state.messageId = res.data?.data?._id;
  log(res.status === 201 && !!state.messageId, "12. Send message (organizer)", `status=${res.status}`);

  // 13) Send message as sponsor
  res = await request("POST", `/messages/${state.collaborationId}`, {
    content: "Thanks for the opportunity! We're excited to collaborate.",
  }, state.sponsorToken);
  log(res.status === 201, "13. Send message (sponsor)", `status=${res.status}`);

  // 14) Get messages with pagination
  res = await request("GET", `/messages/${state.collaborationId}?page=1&limit=10`, null, state.organizerToken);
  const messagesCount = res.data?.data?.length || 0;
  log(res.status === 200 && messagesCount >= 2, "14. Get messages (paginated)", `count=${messagesCount}`);

  // 15) Get unread count
  res = await request("GET", `/messages/${state.collaborationId}/unread-count`, null, state.sponsorToken);
  const unreadCount = res.data?.data?.unreadCount || 0;
  log(res.status === 200 && typeof unreadCount === "number", "15. Get unread count", `unread=${unreadCount}`);

  // 16) Mark message as read
  res = await request("PATCH", `/messages/${state.messageId}/read`, {}, state.sponsorToken);
  const markReadSuccess = res.status === 200 && res.data?.data?.isRead === true;
  log(markReadSuccess, "16. Mark message as read", `status=${res.status}`);

  // 17) Non-participant tries to send message (should fail)
  res = await request("POST", `/messages/${state.collaborationId}`, {
    content: "Unauthorized message",
  }, state.adminToken);
  log(res.status === 403, "17. Send message fails for non-participant", `status=${res.status}`);

  // ===== TEST 3: Document Management =====
  console.log(`\n${colors.cyan}📄 Document Management Tests${colors.reset}`);

  // 18) Upload document as organizer
  try {
    res = await uploadFile(
      `/documents/${state.collaborationId}`,
      "test_document.pdf",
      "agreement",
      state.organizerToken
    );
    state.documentId = res.data?.data?._id;
    const success = res.status === 201 && !!state.documentId;
    log(success, "18. Upload document (organizer)", `status=${res.status}`);
    if (!success && res.data) {
      console.log(`   Error: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    log(false, "18. Upload document (organizer)", `error=${err.message}`);
  }

  // 19) List documents
  res = await request("GET", `/documents/${state.collaborationId}?page=1&limit=10`, null, state.organizerToken);
  const docsCount = res.data?.data?.length || 0;
  log(res.status === 200 && docsCount >= 1, "19. List documents", `count=${docsCount}`);

  // 20) Sponsor tries to list documents
  res = await request("GET", `/documents/${state.collaborationId}?page=1&limit=10`, null, state.sponsorToken);
  log(res.status === 200, "20. Sponsor can list documents", `status=${res.status}`);

  // 21) Non-participant tries to list documents (should fail)
  const fakeCollabId = "507f1f77bcf86cd799439999";
  res = await request("GET", `/documents/${fakeCollabId}?page=1&limit=10`, null, state.adminToken);
  log(res.status === 404 || res.status === 403, "21. List fails for non-participant", `status=${res.status}`);

  // 22) Upload with invalid document type (should still work, defaults to 'other')
  try {
    res = await uploadFile(
      `/documents/${state.collaborationId}`,
      "test_document2.pdf",
      "invoice",
      state.sponsorToken
    );
    const success = res.status === 201;
    log(success, "22. Upload document as sponsor", `status=${res.status}`);
    if (!success && res.data) {
      console.log(`   Error: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    log(false, "22. Upload document as sponsor", `error=${err.message}`);
  }

  // ===== TEST 4: Collaboration Completion =====
  console.log(`\n${colors.cyan}✅ Collaboration Completion Tests${colors.reset}`);

  // 23) Organize can complete collaboration
  res = await request("PATCH", `/collaborations/${state.collaborationId}/complete`, {}, state.organizerToken);
  const completeSuccess = res.status === 200 && res.data?.data?.status === "completed";
  log(completeSuccess, "23. Complete collaboration (active→completed)", `status=${res.status}`);

  // 24) Try to complete again (should fail - already completed)
  res = await request("PATCH", `/collaborations/${state.collaborationId}/complete`, {}, state.organizerToken);
  log(res.status === 400, "24. Complete fails when already completed", `status=${res.status}`);

  // ===== TEST 5: Collaboration Termination (test with new collaboration) =====
  console.log(`\n${colors.cyan}⛔ Collaboration Termination Tests${colors.reset}`);

  // Create another collaboration for termination test
  // 25) Create second proposal
  res = await request("POST", "/proposals", {
    eventId: state.eventId,
    proposedAmount: 15000,
    proposedBenefits: ["Banner"],
    message: "Secondary sponsorship",
  }, state.sponsorToken);
  const proposal2Id = res.data?.data?._id;
  log(res.status === 201 && !!proposal2Id, "25. Create second proposal", `status=${res.status}`);

  // 26) Accept second proposal
  res = await request("PATCH", `/proposals/${proposal2Id}/accept`, {}, state.organizerToken);
  const collab2Id = res.data?.data?.collaboration;
  log(res.status === 200 && !!collab2Id, "26. Accept second proposal (new collab)", `status=${res.status}`);

  // 27) Activate second collaboration
  res = await request("PATCH", `/collaborations/${collab2Id}/activate`, {}, state.organizerToken);
  log(res.status === 200, "27. Activate second collaboration", `status=${res.status}`);

  // 28) Terminate collaboration
  res = await request("PATCH", `/collaborations/${collab2Id}/terminate`, {
    reason: "Budget constraints",
  }, state.organizerToken);
  const terminateSuccess = res.status === 200 && res.data?.data?.status === "terminated";
  log(terminateSuccess, "28. Terminate collaboration (active→terminated)", `status=${res.status}`);

  // 29) Sponsor tries to terminate (should fail - organizer only)
  res = await request("PATCH", `/collaborations/${state.collaborationId}/terminate`, {
    reason: "Test",
  }, state.sponsorToken);
  log(res.status === 403, "29. Terminate fails for non-organizer", `status=${res.status}`);

  // ===== SUMMARY =====
  console.log(`\n${colors.cyan}${"=".repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✅ All collaboration & communication tests completed!${colors.reset}`);
  console.log(`${colors.cyan}${"=".repeat(60)}${colors.reset}`);
}

run().catch((err) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err.message);
  process.exit(1);
});
