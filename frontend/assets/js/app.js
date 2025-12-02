// ======= CONFIG ========
const API_BASE = "http://localhost:5000/api";

// Helper to get / set token
function getToken() {
  return localStorage.getItem("smartmess_token");
}
function setToken(token) {
  localStorage.setItem("smartmess_token", token);
}
function clearToken() {
  localStorage.removeItem("smartmess_token");
}

// Generic fetch wrapper
async function api(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";
  if (getToken()) {
    headers["Authorization"] = "Bearer " + getToken();
  }
  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

// Simple demo data fallback (if backend is not running)
const demoData = {
  totalRegistered: 184,
  confirmed: 152,
  skipped: 32,
  extraMeals: 28,
  messLoadPercent: 72,
  todayMeals: [
    { meal: "Breakfast", status: "Attending" },
    { meal: "Lunch", status: "Skip" },
    { meal: "Dinner", status: "Attending" },
  ],
  weeklyMenu: [
    ["Mon", "Paneer Butter Masala"],
    ["Tue", "Chole Bhature"],
    ["Wed", "Idli Sambhar"],
    ["Thu", "Fried Rice & Manchurian"],
    ["Fri", "Special Biryani"],
  ],
  ngoTickets: [
    { mess: "Hostel A", meals: 25, pickup: "9:30 PM", status: "Available" },
    { mess: "Hostel B", meals: 18, pickup: "9:45 PM", status: "Assigned" },
    { mess: "Hostel C", meals: 30, pickup: "10:00 PM", status: "Expiring" },
  ],
};

// ======= LANDING PAGE BINDING ========
function bindLanding() {
  const totalEl = document.getElementById("totalRegistered");
  if (!totalEl) return; // not on landing

  const confirmedEl = document.getElementById("confirmedCount");
  const skippedEl = document.getElementById("skippedCount");
  const extraMealsEl = document.getElementById("extraMeals");
  const messLoadEl = document.getElementById("messLoadProgress");
  const progressEl = document.getElementById("attendanceProgress");
  const todayMealsList = document.getElementById("todayMealsList");
  const weeklyMenuList = document.getElementById("weeklyMenuList");
  const ngoTableBody = document.querySelector("#ngoTable tbody");
  const adminAttendanceSummary = document.getElementById(
    "adminAttendanceSummary"
  );
  const contactForm = document.getElementById("contactForm");
  const contactStatus = document.getElementById("contactStatus");

  // Fill with demo data first
  totalEl.textContent = demoData.totalRegistered;
  confirmedEl.textContent = demoData.confirmed;
  skippedEl.textContent = demoData.skipped;
  extraMealsEl.textContent = demoData.extraMeals;
  const attendancePercent = Math.round(
    (demoData.confirmed / demoData.totalRegistered) * 100
  );
  if (progressEl) progressEl.style.width = attendancePercent + "%";
  if (messLoadEl) messLoadEl.style.width = demoData.messLoadPercent + "%";

  // Today meals
  if (todayMealsList) {
    todayMealsList.innerHTML = "";
    demoData.todayMeals.forEach((m) => {
      const li = document.createElement("li");
      const spanName = document.createElement("span");
      spanName.textContent = m.meal;
      const pill = document.createElement("span");
      pill.className =
        "pill " + (m.status === "Attending" ? "pill-attending" : "pill-skip");
      pill.textContent = m.status;
      li.appendChild(spanName);
      li.appendChild(pill);
      todayMealsList.appendChild(li);
    });
  }

  // Weekly menu
  if (weeklyMenuList) {
    weeklyMenuList.innerHTML = "";
    demoData.weeklyMenu.forEach(([day, dish]) => {
      const li = document.createElement("li");
      const spanDay = document.createElement("span");
      spanDay.textContent = day;
      const spanDish = document.createElement("span");
      spanDish.textContent = dish;
      li.appendChild(spanDay);
      li.appendChild(spanDish);
      weeklyMenuList.appendChild(li);
    });
  }

  // NGO table
  if (ngoTableBody) {
    ngoTableBody.innerHTML = "";
    demoData.ngoTickets.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${t.mess}</td>
        <td>${t.meals} plates</td>
        <td>${t.pickup}</td>
        <td>
          <span class="pill ${
            t.status === "Available"
              ? "pill-green"
              : t.status === "Assigned"
              ? "pill-outline"
              : "pill-red"
          }">${t.status}</span>
        </td>`;
      ngoTableBody.appendChild(tr);
    });
  }

  if (adminAttendanceSummary) {
    adminAttendanceSummary.textContent =
      "Breakfast: 168 / 220   •   Lunch: 179 / 220   •   Dinner: 191 / 220 (demo)";
  }

  // Contact form (demo only)
  if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      contactStatus.textContent =
        "Thank you! This is a demo form – data is not actually sent.";
    });
  }

  // Try to fetch live dashboard from backend (if available)
  api("/dashboard/home")
    .then((data) => {
      if (data && data.summary) {
        const { total, confirmed, skipped, extraMeals, messLoad } =
          data.summary;
        totalEl.textContent = total;
        confirmedEl.textContent = confirmed;
        skippedEl.textContent = skipped;
        extraMealsEl.textContent = extraMeals;
        const percent = total ? Math.round((confirmed / total) * 100) : 0;
        if (progressEl) progressEl.style.width = percent + "%";
        if (messLoadEl) messLoadEl.style.width = (messLoad || percent) + "%";
      }
      if (data && data.ngoTickets && ngoTableBody) {
        ngoTableBody.innerHTML = "";
        data.ngoTickets.forEach((t) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${t.hostel}</td>
            <td>${t.meals} plates</td>
            <td>${t.pickupTime}</td>
            <td><span class="pill pill-outline">${t.status}</span></td>`;
          ngoTableBody.appendChild(tr);
        });
      }
    })
    .catch(() => {
      // Backend not running – keep demo data
    });
}

// ======= AUTH PAGE ========
function bindAuth() {
  const loginTabBtn = document.querySelector('[data-tab="login"]');
  const signupTabBtn = document.querySelector('[data-tab="signup"]');
  const loginPanel = document.getElementById("loginTab");
  const signupPanel = document.getElementById("signupTab");
  if (!loginTabBtn || !loginPanel) return;

  const tabs = [loginTabBtn, signupTabBtn];
  const panels = [loginPanel, signupPanel];

  tabs.forEach((btn) =>
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const id = btn.dataset.tab === "login" ? "loginTab" : "signupTab";
      document.getElementById(id).classList.add("active");
    })
  );

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginStatus = document.getElementById("loginStatus");
  const signupStatus = document.getElementById("signupStatus");

  // Signup
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      signupStatus.textContent = "Creating account...";
      try {
        const body = {
          name: document.getElementById("signupName").value,
          email: document.getElementById("signupEmail").value,
          password: document.getElementById("signupPassword").value,
          role: document.getElementById("signupRole").value,
        };
        const data = await api("/auth/signup", {
          method: "POST",
          body: JSON.stringify(body),
        });
        signupStatus.textContent = data.message || "Account created!";
      } catch (err) {
        signupStatus.textContent = err.message;
      }
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginStatus.textContent = "Logging in...";
      try {
        const body = {
          email: document.getElementById("loginEmail").value,
          password: document.getElementById("loginPassword").value,
        };
        const data = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setToken(data.token);
        loginStatus.textContent = "Login successful!";
        // redirect based on role
        if (data.user.role === "admin") {
          window.location.href = "admin.html";
        } else if (data.user.role === "ngo") {
          window.location.href = "ngo.html";
        } else {
          window.location.href = "student.html";
        }
      } catch (err) {
        loginStatus.textContent = err.message;
      }
    });
  }
}

// ======= STUDENT PORTAL ========
function bindStudentPortal() {
  const container = document.getElementById("attendanceButtons");
  if (!container) return;

  const studentNameEl = document.getElementById("studentName");
  const weeklyMenuEl = document.getElementById("studentWeeklyMenu");
  const statusEl = document.getElementById("attendanceStatus");
  const saveBtn = document.getElementById("saveAttendanceBtn");
  const logoutBtn = document.getElementById("logoutBtnStudent");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearToken();
      window.location.href = "auth.html";
    });
  }

  const meals = ["Breakfast", "Lunch", "Dinner"];
  const selections = {};

  container.innerHTML = "";
  meals.forEach((meal) => {
    const div = document.createElement("div");
    div.className = "attendance-card";
    div.innerHTML = `<strong>${meal}</strong><span>Click to toggle</span>`;
    div.addEventListener("click", () => {
      selections[meal] = selections[meal] === "attending" ? "skipped" : "attending";
      div.classList.toggle("selected", selections[meal] === "attending");
      div.querySelector(
        "span"
      ).textContent = selections[meal] === "attending" ? "Attending" : "Skip";
    });
    container.appendChild(div);
  });

  // Weekly menu (demo or backend)
  demoData.weeklyMenu.forEach(([day, dish]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${day}</span><span>${dish}</span>`;
    weeklyMenuEl.appendChild(li);
  });

  // Load student dashboard from backend
  api("/student/dashboard")
    .then((data) => {
      if (data.user && studentNameEl) {
        studentNameEl.textContent = data.user.name;
      }
      if (data.weeklyMenu && Array.isArray(data.weeklyMenu)) {
        weeklyMenuEl.innerHTML = "";
        data.weeklyMenu.forEach(([day, dish]) => {
          const li = document.createElement("li");
          li.innerHTML = `<span>${day}</span><span>${dish}</span>`;
          weeklyMenuEl.appendChild(li);
        });
      }
    })
    .catch(() => {
      // not logged in or backend not running
    });

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      statusEl.textContent = "Saving...";
      try {
        const payload = {
          date: new Date().toISOString().slice(0, 10),
          meals: meals.map((meal) => ({
            mealType: meal.toLowerCase(),
            status: selections[meal] || "skipped",
          })),
        };
        await api("/student/attendance", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        statusEl.textContent = "Attendance saved successfully!";
      } catch (err) {
        statusEl.textContent = err.message;
      }
    });
  }
}

// ======= ADMIN PORTAL ========
function bindAdminPortal() {
  const overviewEl = document.getElementById("adminOverviewText");
  const leftoverForm = document.getElementById("leftoverForm");
  const leftoverStatus = document.getElementById("leftoverStatus");
  const logoutBtn = document.getElementById("logoutBtnAdmin");
  if (!overviewEl) return;

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearToken();
      window.location.href = "auth.html";
    });
  }

  api("/admin/overview")
    .then((data) => {
      overviewEl.textContent =
        data.text ||
        `Confirmed: ${data.confirmed} / ${data.total} students (demo overview)`;
    })
    .catch(() => {
      overviewEl.textContent =
        "Could not load from backend. Showing demo overview: Confirmed 152 / 184 students.";
    });

  if (leftoverForm && leftoverStatus) {
    leftoverForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      leftoverStatus.textContent = "Creating donation ticket...";
      try {
        const body = {
          hostel: document.getElementById("hostelName").value,
          preparedMeals: Number(
            document.getElementById("preparedMeals").value || 0
          ),
          servedMeals: Number(document.getElementById("servedMeals").value || 0),
          pickupTime: document.getElementById("pickupTime").value,
        };
        const data = await api("/admin/leftover", {
          method: "POST",
          body: JSON.stringify(body),
        });
        leftoverStatus.textContent = data.message || "Ticket created!";
      } catch (err) {
        leftoverStatus.textContent = err.message;
      }
    });
  }
}

// ======= NGO PORTAL ========
function bindNgoPortal() {
  const tableBody = document.querySelector("#ngoPortalTable tbody");
  const statusEl = document.getElementById("ngoStatus");
  const logoutBtn = document.getElementById("logoutBtnNgo");
  if (!tableBody) return;

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearToken();
      window.location.href = "auth.html";
    });
  }

  api("/ngo/dashboard")
    .then((data) => {
      const tickets = data.tickets || [];
      if (!tickets.length) {
        statusEl.textContent = "No active tickets. Please check again later.";
        return;
      }
      tableBody.innerHTML = "";
      tickets.forEach((t) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${t.hostel}</td>
          <td>${t.meals}</td>
          <td>${t.pickupTime}</td>
          <td><span class="pill pill-outline">${t.status}</span></td>`;
        tableBody.appendChild(tr);
      });
    })
    .catch(() => {
      statusEl.textContent =
        "Backend not reachable, showing demo NGO data from landing page.";
      tableBody.innerHTML = "";
      demoData.ngoTickets.forEach((t) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${t.mess}</td>
          <td>${t.meals}</td>
          <td>${t.pickup}</td>
          <td><span class="pill pill-outline">${t.status}</span></td>`;
        tableBody.appendChild(tr);
      });
    });
}

// ======= INIT ========
document.addEventListener("DOMContentLoaded", () => {
  bindLanding();
  bindAuth();
  bindStudentPortal();
  bindAdminPortal();
  bindNgoPortal();
});
