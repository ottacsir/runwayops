const state = {
  shows: [],
  myApplications: [],
  myCollections: [],
  org: {
    showId: null,
    collections: [],
    applications: [],
  },
};

const homeView = document.getElementById("homeView");
const enterAppBtn = document.getElementById("enterAppBtn");
const backToHomeBtn = document.getElementById("backToHomeBtn");

const authBox = document.getElementById("authBox");
const dashboardBox = document.getElementById("dashboardBox");
const welcomeMsg = document.getElementById("welcomeMsg");
const logoutBtn = document.getElementById("logoutBtn");

const loginTabBtn = document.getElementById("loginTabBtn");
const registerTabBtn = document.getElementById("registerTabBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const roleNav = document.getElementById("roleNav");

enterAppBtn.addEventListener("click", () => {
  homeView.classList.add("hidden");
  authBox.classList.remove("hidden");
});

backToHomeBtn.addEventListener("click", () => {
  authBox.classList.add("hidden");
  homeView.classList.remove("hidden");
});
function badge(status) {
  return `<span class="badge badge-${status}">${status.replace("_", " ")}</span>`;
}
function setActiveView(viewId) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  document.getElementById(viewId).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });
}

function userHasRole(allowedCsv) {
  const user = getUser();
  if (!user) return false;
  return allowedCsv.split(",").includes(user.role);
}
loginTabBtn.addEventListener("click", () => {
  loginTabBtn.classList.add("active");
  registerTabBtn.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

registerTabBtn.addEventListener("click", () => {
  registerTabBtn.classList.add("active");
  loginTabBtn.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const data = await apiRequest("/auth/login", "POST", { email, password });
    saveSession(data.token, data.user);
    authBox.classList.add("hidden");
    await enterDashboard();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("registerError");
  errorEl.textContent = "";

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const role = document.getElementById("registerRole").value;

  try {
    const data = await apiRequest("/auth/register", "POST", { name, email, password, role });
    saveSession(data.token, data.user);
    authBox.classList.add("hidden");
    await enterDashboard();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

logoutBtn.addEventListener("click", () => {
  clearSession();

  document.body.style.backgroundImage =
    'linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.72)), url("pictures/runway2.jpg")';

  dashboardBox.classList.add("hidden");
  authBox.classList.add("hidden");
  homeView.classList.remove("hidden");
});
async function enterDashboard() {
  const user = getUser();
const roleBackgrounds = {
  designer: "pictures/runway3.jpg",
  model: "pictures/runway1.jpg",
  organizer: "pictures/runway4.jpg",
  admin: "pictures/runway2.jpg"
};

document.body.style.backgroundImage =
  `linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.72)),
   url("${roleBackgrounds[user.role] || "pictures/runway1.jpg"}")`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";
document.body.style.backgroundAttachment = "fixed";
document.body.style.backgroundRepeat = "no-repeat";
  homeView.classList.add("hidden");
  authBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
  welcomeMsg.textContent = `${user.name} — ${user.role}`;
  document.querySelectorAll(".nav-btn[data-role]").forEach((btn) => {
    btn.classList.toggle("hidden", !userHasRole(btn.dataset.role));
  });
  document.getElementById("createShowBox").classList.toggle(
    "hidden",
    !userHasRole("organizer,admin")
  );
  setActiveView("viewShows");
  await loadShows();
  if (userHasRole("model,admin")) {
    await loadMyApplications();
  }
}
roleNav.addEventListener("click", async (e) => {
  const btn = e.target.closest(".nav-btn");
  if (!btn || btn.classList.contains("hidden")) return;
  setActiveView(btn.dataset.view);
  if (btn.dataset.view === "viewMyCollections") await loadMyCollections();
  if (btn.dataset.view === "viewMyApplications") await loadMyApplications();
});
const showForm = document.getElementById("showForm");
const showsList = document.getElementById("showsList");
const showMessage = document.getElementById("showMessage");

showForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMessage.textContent = "";
  const title = document.getElementById("showTitle").value;
  const venue = document.getElementById("showVenue").value;
  const show_date = document.getElementById("showDate").value;
  try {
    await apiRequest("/shows", "POST", { title, venue, show_date });
    showMessage.textContent = "✅ Show created.";
    showForm.reset();
    await loadShows();
  } catch (err) {
    showMessage.textContent = "❌ " + err.message;
  }
});

async function loadShows() {
  try {
    state.shows = await apiRequest("/shows");
    renderShows();
    populateShowSelects();
  } catch (err) {
    showsList.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

function renderShows() {
  if (state.shows.length === 0) {
    showsList.innerHTML = "<p>No shows yet.</p>";
    return;
  }

  showsList.innerHTML = state.shows
    .map((show) => {
      let actionHtml = "";

      if (userHasRole("model")) {
        const existingApp = state.myApplications.find((a) => a.show_id === show.id);
        if (existingApp) {
          actionHtml = `<p>Your status: ${badge(existingApp.status)}</p>`;
        } else {
          actionHtml = `<button class="btn-small btn-neutral" onclick="applyToShow(${show.id})">Apply to Cast</button>`;
        }
      }

      if (userHasRole("designer")) {
        actionHtml += `<button class="btn-small btn-neutral" onclick="goSubmitCollection(${show.id})">Submit Collection</button>`;
      }

      if (userHasRole("organizer,admin")) {
        actionHtml += `
<button class="btn-small btn-neutral" onclick="goManageShow(${show.id})">
Manage
</button>
<button class="btn-small btn-reject" onclick="deleteShow(${show.id})">
Delete
</button>
`;
      }

      return `
        <div class="item-card">
          <h3>${show.title}</h3>
          <p><strong>Venue:</strong> ${show.venue ?? "N/A"}</p>
          <p><strong>Date:</strong> ${show.show_date?.slice(0, 10)}</p>
          <p><strong>Organizer:</strong> ${show.organizer_name}</p>
          <p>${badge(show.status)}</p>
          <div class="actions-row">${actionHtml}</div>
        </div>
      `;
    })
    .join("");
}

function populateShowSelects() {
  const options = state.shows
    .map((s) => `<option value="${s.id}">${s.title} (${s.show_date?.slice(0, 10)})</option>`)
    .join("");

  const collectionShowSelect = document.getElementById("collectionShow");
  collectionShowSelect.innerHTML = `<option value="">Select a Show</option>` + options;

  const organizerShowSelect = document.getElementById("organizerShowSelect");
  organizerShowSelect.innerHTML = `<option value="">Select a show to manage</option>` + options;
}

async function applyToShow(showId) {
  try {
    await apiRequest("/applications", "POST", { show_id: showId });
    await loadMyApplications();
    renderShows();
  } catch (err) {
    alert(err.message);
  }
}

function goSubmitCollection(showId) {
  setActiveView("viewMyCollections");
  loadMyCollections();
  document.getElementById("collectionShow").value = showId;
}

function goManageShow(showId) {
  setActiveView("viewOrganizer");
  const select = document.getElementById("organizerShowSelect");
  select.value = showId;
  select.dispatchEvent(new Event("change"));
}
async function deleteShow(id) {

    if (!confirm("Delete this fashion show?")) {
        return;
    }
    try {
        await apiRequest(`/shows/${id}`, "DELETE");
        await loadShows();
        alert("Show deleted.");
    } catch (err) {
        alert(err.message);
    }

}
const collectionForm = document.getElementById("collectionForm");
const collectionsList = document.getElementById("collectionsList");
const collectionMessage = document.getElementById("collectionMessage");
collectionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  collectionMessage.textContent = "";

  const show_id = document.getElementById("collectionShow").value;
  const title = document.getElementById("collectionTitle").value;
  const description = document.getElementById("collectionDescription").value;

  try {
    await apiRequest("/collections", "POST", { show_id, title, description });
    collectionMessage.textContent = "✅ Collection submitted.";
    collectionForm.reset();
    await loadMyCollections();
  } catch (err) {
    collectionMessage.textContent = "❌ " + err.message;
  }
});

async function loadMyCollections() {
  try {
    state.myCollections = await apiRequest("/collections/mine");
    await renderMyCollections();
  } catch (err) {
    collectionsList.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

async function renderMyCollections() {
  if (state.myCollections.length === 0) {
    collectionsList.innerHTML = "<p>No collections submitted yet.</p>";
    return;
  }

  const cards = await Promise.all(
    state.myCollections.map(async (col) => {
      let looksHtml = "<p><em>No looks added yet.</em></p>";
      try {
        const looks = await apiRequest(`/looks/collection/${col.id}`);
        if (looks.length > 0) {
          looksHtml = looks
            .map((l) => `<p>Look #${l.look_number} — ${l.description ?? ""}</p>`)
            .join("");
        }
      } catch (_) {}

      return `
        <div class="item-card">
          <h3>${col.title}</h3>
          <p>${col.description ?? ""}</p>
          <p>${badge(col.status)}</p>
          <hr>
          ${looksHtml}
          <form class="inline-form-row" onsubmit="return addLook(event, ${col.id})">
            <input type="number" placeholder="Look #" min="1" required style="width:80px" class="lookNumberInput">
            <input type="text" placeholder="Look description" class="lookDescInput">
            <button class="btn-small btn-neutral">Add Look</button>
          </form>
        </div>
      `;
    })
  );

  collectionsList.innerHTML = cards.join("");
}

async function addLook(event, collectionId) {
  event.preventDefault();
  const form = event.target;
  const look_number = form.querySelector(".lookNumberInput").value;
  const description = form.querySelector(".lookDescInput").value;

  try {
    await apiRequest("/looks", "POST", {
      collection_id: collectionId,
      look_number,
      description,
    });
    await loadMyCollections();
  } catch (err) {
    alert(err.message);
  }
  return false;
}
const applicationsList = document.getElementById("applicationsList");

async function loadMyApplications() {
  try {
    state.myApplications = await apiRequest("/applications/mine");
    renderMyApplications();
  } catch (err) {
    applicationsList.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

function renderMyApplications() {
  if (state.myApplications.length === 0) {
    applicationsList.innerHTML = "<p>You haven't applied to any shows yet.</p>";
    return;
  }

  applicationsList.innerHTML = state.myApplications
    .map(
      (app) => `
      <div class="item-card">
        <h3>${app.show_title}</h3>
        <p><strong>Show Date:</strong> ${app.show_date?.slice(0, 10)}</p>
        <p>${badge(app.status)}</p>
      </div>
    `
    )
    .join("");
}
const organizerShowSelect = document.getElementById("organizerShowSelect");
const organizerContent = document.getElementById("organizerContent");
const showStatusSelect = document.getElementById("showStatusSelect");

organizerShowSelect.addEventListener("change", async () => {
  const showId = organizerShowSelect.value;
  if (!showId) {
    organizerContent.classList.add("hidden");
    return;
  }

  state.org.showId = showId;
  organizerContent.classList.remove("hidden");

  const show = state.shows.find((s) => String(s.id) === String(showId));
  if (show) showStatusSelect.value = show.status;

  await Promise.all([
    loadOrgCollections(showId),
    loadOrgApplications(showId),
    loadRunOfShow(showId),
    loadSeating(showId),
    populateGuestOptions(),
  ]);
});

document.getElementById("updateShowStatusBtn").addEventListener("click", async () => {
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = "";
  const showId = state.org.showId;
  const status = showStatusSelect.value;

  try {
    await apiRequest(`/shows/${showId}/status`, "PATCH", { status });
    statusMessage.textContent = "✅ Status updated.";
    await loadShows();
  } catch (err) {
    statusMessage.textContent = "❌ " + err.message;
  }
});

async function loadOrgCollections(showId) {
  const el = document.getElementById("orgCollectionsList");
  try {
    state.org.collections = await apiRequest(`/collections/show/${showId}`);
    if (state.org.collections.length === 0) {
      el.innerHTML = "<p>No collections submitted for this show yet.</p>";
    } else {
      el.innerHTML = state.org.collections
        .map(
          (col) => `
          <div class="item-card">
            <h3>${col.title}</h3>
            <p><strong>Designer:</strong> ${col.designer_name}</p>
            <p>${col.description ?? ""}</p>
            <p>${badge(col.status)}</p>
            <div class="actions-row">
              <button class="btn-small btn-approve" onclick="setCollectionStatus(${col.id}, 'approved')">Approve</button>
              <button class="btn-small btn-reject" onclick="setCollectionStatus(${col.id}, 'rejected')">Reject</button>
            </div>
          </div>
        `
        )
        .join("");
    }
  } catch (err) {
    el.innerHTML = `<p class="error">${err.message}</p>`;
  }
  await populateAssignLookOptions(showId);
}

async function setCollectionStatus(collectionId, status) {
  try {
    await apiRequest(`/collections/${collectionId}/status`, "PATCH", { status });
    await loadOrgCollections(state.org.showId);
  } catch (err) {
    alert(err.message);
  }
}

async function loadOrgApplications(showId) {
  const el = document.getElementById("orgApplicationsList");
  try {
    state.org.applications = await apiRequest(`/applications/show/${showId}`);
    if (state.org.applications.length === 0) {
      el.innerHTML = "<p>No casting applications for this show yet.</p>";
    } else {
      el.innerHTML = state.org.applications
        .map(
          (app) => `
          <div class="item-card">
            <h3>${app.model_name}</h3>
            <p>${app.model_email}</p>
            <p>${badge(app.status)}</p>
            <div class="actions-row">
              <button class="btn-small btn-neutral" onclick="setApplicationStatus(${app.id}, 'shortlisted')">Shortlist</button>
              <button class="btn-small btn-approve" onclick="setApplicationStatus(${app.id}, 'accepted')">Accept</button>
              <button class="btn-small btn-reject" onclick="setApplicationStatus(${app.id}, 'rejected')">Reject</button>
            </div>
          </div>
        `
        )
        .join("");
    }
  } catch (err) {
    el.innerHTML = `<p class="error">${err.message}</p>`;
  }
  await populateAssignModelOptions();
}

async function setApplicationStatus(applicationId, status) {
  try {
    await apiRequest(`/applications/${applicationId}/status`, "PATCH", { status });
    await loadOrgApplications(state.org.showId);
  } catch (err) {
    alert(err.message);
  }
}

async function populateAssignLookOptions(showId) {
  const select = document.getElementById("assignLook");
  const approved = state.org.collections.filter((c) => c.status === "approved");

  let optionsHtml = `<option value="">Select Look</option>`;

  for (const col of approved) {
    try {
      const looks = await apiRequest(`/looks/collection/${col.id}`);
      looks.forEach((look) => {
        optionsHtml += `<option value="${look.id}">${col.title} — Look #${look.look_number}</option>`;
      });
    } catch (_) {}
  }

  select.innerHTML = optionsHtml;
}

function populateAssignModelOptions() {
  const select = document.getElementById("assignModel");
  const accepted = state.org.applications.filter((a) => a.status === "accepted");

  select.innerHTML =
    `<option value="">Select Accepted Model</option>` +
    accepted.map((a) => `<option value="${a.model_id}">${a.model_name}</option>`).join("");
}

const assignmentForm = document.getElementById("assignmentForm");
assignmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const assignmentMessage = document.getElementById("assignmentMessage");
  assignmentMessage.textContent = "";

  const look_id = document.getElementById("assignLook").value;
  const model_id = document.getElementById("assignModel").value;
  const walk_order = document.getElementById("assignWalkOrder").value;

  try {
    await apiRequest("/assignments", "POST", {
      look_id,
      model_id,
      show_id: state.org.showId,
      walk_order,
    });
    assignmentMessage.textContent = "✅ Added to run-of-show.";
    assignmentForm.reset();
    await loadRunOfShow(state.org.showId);
  } catch (err) {
    assignmentMessage.textContent = "❌ " + err.message;
  }
});

async function loadRunOfShow(showId) {
  const el = document.getElementById("runOfShowList");
  try {
    const rows = await apiRequest(`/assignments/show/${showId}/script`);
    if (rows.length === 0) {
      el.innerHTML = "<p>No looks assigned yet.</p>";
      return;
    }
    el.innerHTML = `
      <table>
        <thead><tr><th>Walk #</th><th>Model</th><th>Collection</th><th>Look</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${r.walk_order}</td>
              <td>${r.model_name}</td>
              <td>${r.collection_title}</td>
              <td>${r.look_description ?? ""}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = `<p class="error">${err.message}</p>`;
  }
}
async function populateGuestOptions() {
  const select = document.getElementById("seatingGuestSelect");
  try {
    const users = await apiRequest("/users");
    select.innerHTML =
      `<option value="">Select Guest</option>` +
      users.map((u) => `<option value="${u.id}">${u.name} (${u.role})</option>`).join("");
  } catch (err) {
    select.innerHTML = `<option value="">Could not load users</option>`;
  }
}

const seatingForm = document.getElementById("seatingForm");
seatingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const seatingMessage = document.getElementById("seatingMessage");
  seatingMessage.textContent = "";

  const guest_id = document.getElementById("seatingGuestSelect").value;
  const seat_section = document.getElementById("seatingSection").value;
  const seat_number = document.getElementById("seatingNumber").value;

  try {
    await apiRequest("/seating", "POST", {
      show_id: state.org.showId,
      guest_id,
      seat_section,
      seat_number,
    });
    seatingMessage.textContent = "✅ Seat assigned.";
    seatingForm.reset();
    await loadSeating(state.org.showId);
  } catch (err) {
    seatingMessage.textContent = "❌ " + err.message;
  }
});

async function loadSeating(showId) {
  const el = document.getElementById("seatingList");
  try {
    const rows = await apiRequest(`/seating/show/${showId}`);
    if (rows.length === 0) {
      el.innerHTML = "<p>No seats assigned yet.</p>";
      return;
    }
    el.innerHTML = `
      <table>
        <thead><tr><th>Guest</th><th>Section</th><th>Seat #</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${r.guest_name}</td>
              <td>${r.seat_section}</td>
              <td>${r.seat_number}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = `<p class="error">${err.message}</p>`;
  }
}
(async function init() {
  if (getToken() && getUser()) {
    homeView.classList.add("hidden");
    authBox.classList.add("hidden");
    await enterDashboard();
  } else {
    document.body.style.backgroundImage =
  'linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.72)), url("pictures/runway2.jpg")';
    homeView.classList.remove("hidden");
    authBox.classList.add("hidden");
    dashboardBox.classList.add("hidden");
  }
})();
