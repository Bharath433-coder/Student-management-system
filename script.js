// ---- Configuration ----
// If your Django server runs somewhere else, change this.
const API_BASE = "http://127.0.0.1:8000/api";

// ---- State ----
let allStudents = [];
let editingId = null;

// ---- DOM references ----
const form = document.getElementById("student-form");
const idField = document.getElementById("student-id");
const nameField = document.getElementById("name");
const rollField = document.getElementById("roll_number");
const deptField = document.getElementById("department");
const yearField = document.getElementById("year");
const emailField = document.getElementById("email");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formMessage = document.getElementById("form-message");

const tbody = document.getElementById("student-tbody");
const emptyState = document.getElementById("empty-state");
const searchBox = document.getElementById("search-box");

const DEPT_LABELS = {
  CSE: "CSE", ECE: "ECE", EEE: "EEE",
  MECH: "MECH", CIVIL: "Civil", IT: "IT",
};

// ---- API helpers ----
async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null; // DELETE has no body

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // DRF validation errors come back as { field: ["message"] }
    const firstError = Object.values(data)[0];
    const text = Array.isArray(firstError) ? firstError[0] : "Something went wrong. Please check the form.";
    throw new Error(text);
  }
  return data;
}

function fetchStudents() {
  return apiRequest("/students/").then((data) => (Array.isArray(data) ? data : data.results || []));
}

function createStudent(payload) {
  return apiRequest("/students/", { method: "POST", body: JSON.stringify(payload) });
}

function updateStudent(id, payload) {
  return apiRequest(`/students/${id}/`, { method: "PUT", body: JSON.stringify(payload) });
}

function deleteStudent(id) {
  return apiRequest(`/students/${id}/`, { method: "DELETE" });
}

// ---- Rendering ----
function renderTable(students) {
  tbody.innerHTML = "";

  if (students.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  for (const student of students) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.roll_number)}</td>
      <td><span class="dept-badge">${DEPT_LABELS[student.department] || student.department}</span></td>
      <td>${student.year}</td>
      <td>${escapeHtml(student.email)}</td>
      <td class="row-actions">
        <button class="edit-btn" data-id="${student.id}">Edit</button>
        <button class="delete-btn" data-id="${student.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function showMessage(text, kind) {
  formMessage.textContent = text;
  formMessage.className = `message ${kind}`;
  formMessage.hidden = false;
}

function clearMessage() {
  formMessage.hidden = true;
  formMessage.textContent = "";
}

// ---- Form state ----
function resetForm() {
  form.reset();
  idField.value = "";
  editingId = null;
  formTitle.textContent = "Add a student";
  submitBtn.textContent = "Add student";
  cancelBtn.hidden = true;
  clearMessage();
}

function enterEditMode(student) {
  editingId = student.id;
  idField.value = student.id;
  nameField.value = student.name;
  rollField.value = student.roll_number;
  deptField.value = student.department;
  yearField.value = student.year;
  emailField.value = student.email;

  formTitle.textContent = `Edit ${student.name}`;
  submitBtn.textContent = "Update student";
  cancelBtn.hidden = false;
  clearMessage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---- Load + refresh ----
async function loadStudents() {
  try {
    allStudents = await fetchStudents();
    applySearch();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Could not reach the server. Is the Django backend running on ${API_BASE}?</td></tr>`;
  }
}

function applySearch() {
  const term = searchBox.value.trim().toLowerCase();
  if (!term) {
    renderTable(allStudents);
    return;
  }
  const filtered = allStudents.filter((s) =>
    [s.name, s.roll_number, s.department, s.email].join(" ").toLowerCase().includes(term)
  );
  renderTable(filtered);
}

// ---- Event listeners ----
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const payload = {
    name: nameField.value.trim(),
    roll_number: rollField.value.trim(),
    department: deptField.value,
    year: Number(yearField.value),
    email: emailField.value.trim(),
  };

  try {
    if (editingId) {
      await updateStudent(editingId, payload);
      showMessage("Student updated.", "success");
    } else {
      await createStudent(payload);
      showMessage("Student added.", "success");
    }
    resetForm();
    await loadStudents();
  } catch (err) {
    showMessage(err.message, "error");
  }
});

cancelBtn.addEventListener("click", resetForm);

tbody.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("edit-btn")) {
    const student = allStudents.find((s) => String(s.id) === id);
    if (student) enterEditMode(student);
  }

  if (e.target.classList.contains("delete-btn")) {
    const student = allStudents.find((s) => String(s.id) === id);
    const ok = confirm(`Delete ${student ? student.name : "this student"}? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteStudent(id);
      await loadStudents();
    } catch (err) {
      alert(err.message);
    }
  }
});

searchBox.addEventListener("input", applySearch);

// ---- Init ----
loadStudents();
