// ── Element refs ──
const $ = id => document.getElementById(id);

const callConnection      = $("callConnection");
const connectedResponse   = $("connectedResponse");
const reasonNotConnected  = $("reasonNotConnected");
const notInterested       = $("notInterested");
const nextCall            = $("nextCall");
const nextDate            = $("nextDate");
const remarks             = $("remarks");
const requirement         = $("requirement");
const loadingEl           = $("loading");

// Wrapper divs (for label+select grouping)
const wrapReasonNC        = $("wrap-reasonNotConnected");
const wrapConnected       = $("wrap-connectedResponse");
const wrapNextCall        = $("wrap-nextCall");
const wrapNotInterested   = $("wrap-notInterested");
const wrapRemarks         = $("wrap-remarks");

const show = el => { if (el) el.style.display = "block"; };
const hide = el => { if (el) el.style.display = "none"; };
const showFlex = el => { if (el) el.style.display = "flex"; };

// ── Form Logic ──

callConnection.addEventListener("change", function () {
  if (this.value === "connected") {
    show(wrapConnected);
    hide(wrapReasonNC);
  } else {
    hide(wrapConnected);
    show(wrapReasonNC);
    [wrapNextCall, wrapNotInterested, requirement, wrapRemarks].forEach(hide);
  }
});

reasonNotConnected.addEventListener("change", function () {
  this.value === "other" ? show(wrapRemarks) : hide(wrapRemarks);
});

connectedResponse.addEventListener("change", function () {
  // Reset sub-sections
  [wrapNotInterested, requirement, wrapRemarks].forEach(hide);
  Array.from(nextCall.options).forEach(o => o.style.display = "");

  if (this.value === "not interested") {
    [wrapNextCall].forEach(hide);
    show(wrapNotInterested);
  } else {
    showFlex(wrapNextCall);
    if (this.value === "busy" || this.value === "details shared") {
      // Hide "Appointment" option for busy/details shared
      nextCall.options[1].style.display = "none";
    }
  }
});

notInterested.addEventListener("change", function () {
  if (this.value === "requirement not matched") {
    show(requirement); hide(wrapRemarks);
  } else if (this.value === "other") {
    hide(requirement); show(wrapRemarks);
  } else {
    hide(requirement); hide(wrapRemarks);
  }
});

// ── Google Sheet Submission ──
document.addEventListener("DOMContentLoaded", () => {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0dgD3chPJr7bU-v1wo0TaEbY-WU1bQ6nclJTMpV8Fnmpl6TTVOmXcZgLrIrZfI16AIQ/exec";
  const form = document.forms[0];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.style.display = "none";
    loadingEl.classList.add("visible");

    try {
      await fetch(SCRIPT_URL, { method: "POST", body: new FormData(form) });
      console.log("Submitted successfully");
    } catch (err) {
      console.error("Submission error:", err.message);
    } finally {
      form.reset();
      location.reload();
    }
  });
});

// ── Airtable Leads ──
const PERSONAL_ACCESS_TOKEN = "patH8mpjUZ70W15YH.345d4885c64fed665ef580df9b5a374cf9f2512e64c641cbf5621b71e311860d";
const BASE_ID     = "app64XLYspqDRZKCc";
const TABLE_NAME  = "Leads";
const FIELD_NAME       = "Name";
const FIELD_NUMBER     = "Number";
const FIELD_ALT_NUMBER = "Alternate Number";
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

function copyToClipboard(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "✅";
    setTimeout(() => btn.textContent = orig, 1500);
  }).catch(err => console.error("Copy failed:", err));
}

function buildRow(number, isAlt = false) {
  const plain = number.replace(/[^0-9]/g, "");
  const row = document.createElement("div");
  row.className = "number-row";
  row.innerHTML = `
    <span class="${isAlt ? "alt-text" : "number-text"}">${isAlt ? "Alt: " : "📱 "}${plain}</span>
    <div class="action-group">
      <a href="tel:${number.replace(/\s+/g, "")}" class="action-btn" title="Call">📞</a>
      <button class="action-btn copy-btn" title="Copy">📋</button>
    </div>`;
  row.querySelector(".copy-btn").addEventListener("click", function () {
    copyToClipboard(this, plain);
  });
  return row;
}

async function fetchAirtableSlabs() {
  const grid = $("slabs-grid");
  try {
    const res = await fetch(AIRTABLE_URL, {
      headers: { Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { records } = await res.json();

    grid.innerHTML = records.length === 0
      ? '<div class="status-msg">No leads for today.</div>'
      : "";

    records.forEach(({ fields }) => {
      const name      = fields[FIELD_NAME]       || "No Name";
      const number    = fields[FIELD_NUMBER]     || "";
      const altNumber = fields[FIELD_ALT_NUMBER] || "";

      const slab = document.createElement("div");
      slab.className = "slab";

      const nameDiv = document.createElement("div");
      nameDiv.className = "slab-name";
      nameDiv.textContent = name;
      slab.appendChild(nameDiv);

      if (number)    slab.appendChild(buildRow(number));
      if (altNumber) slab.appendChild(buildRow(altNumber, true));

      grid.appendChild(slab);
    });
  } catch (err) {
    console.error("Airtable fetch error:", err);
    grid.innerHTML = '<div class="status-msg" style="color:red;">Error loading leads. Check connection.</div>';
  }
}

fetchAirtableSlabs();

// ── Navigation ──
function navData(btn) {
  document.forms[0].style.display = "none";
  $("newLeads").style.display = "block";
  setActiveNav(btn || $("nav-data"));
}

function navForm(btn) {
  document.forms[0].style.display = "flex";
  $("newLeads").style.display = "none";
  setActiveNav(btn || $("nav-response"));
}

function setActiveNav(activeBtn) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");
}
