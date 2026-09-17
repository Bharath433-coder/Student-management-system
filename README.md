# Student Management System — CRUD Activity

A full-stack CRUD web application: HTML/CSS/JavaScript frontend talking to a
Django REST Framework backend, backed by SQLite. Built to satisfy the
CRUD Web Application SOP (frontend, backend, REST API, database, validation,
testing).

## 1. Project overview
- **Problem statement:** College staff need a simple way to add, view, update,
  and remove student records instead of tracking them on paper/Excel.
- **Entity managed:** `Student` — name, roll number, department, year, email.
- **Architecture:**
  `Browser (HTML/CSS/JS)` → `fetch()` → `REST API (Django REST Framework)` →
  `ORM` → `SQLite database`

## 2. Technology stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (fetch API) |
| Backend | Django + Django REST Framework |
| Database | SQLite |
| CORS | django-cors-headers |
| API testing | Postman (or curl) |

## 3. Project structure
```
student-management-crud/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── studentapi/          # project settings, urls
│   └── students/            # app: model, serializer, view, urls, admin
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## 4. Database design
Single table `students_student`:

| Field | Type | Constraints |
|---|---|---|
| id | AutoField | primary key |
| name | CharField(100) | required |
| roll_number | CharField(20) | required, unique |
| department | CharField(10) | required, one of CSE/ECE/EEE/MECH/CIVIL/IT |
| year | PositiveSmallInteger | required, 1–4 |
| email | EmailField | required, unique, valid email format |
| created_at | DateTimeField | auto |
| updated_at | DateTimeField | auto |

## 5. Setup and execution

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

# optional, for /admin/ access:
python manage.py createsuperuser

python manage.py runserver
```
The API is now live at `http://127.0.0.1:8000/api/students/`.

### Frontend
No build step — just open the file:
```bash
cd frontend
# double-click index.html, OR serve it so fetch works smoothly:
python -m http.server 5500
```
Then visit `http://127.0.0.1:5500` (or double-click `index.html` directly).
Keep the Django server running in another terminal at the same time.

If your backend runs on a different host/port, update `API_BASE` at the top
of `frontend/script.js`.

## 6. REST API documentation
| Operation | Method | Endpoint | Result |
|---|---|---|---|
| Create | POST | `/api/students/` | New student created |
| Read all | GET | `/api/students/` | List of all students |
| Read one | GET | `/api/students/{id}/` | Single student |
| Update | PUT | `/api/students/{id}/` | Student updated |
| Delete | DELETE | `/api/students/{id}/` | Student removed |
| Search | GET | `/api/students/?search=priya` | Filtered list (name/roll/dept/email) |

Sample request body (POST/PUT):
```json
{
  "name": "Priya Ramesh",
  "roll_number": "22CS045",
  "department": "CSE",
  "year": 2,
  "email": "priya@example.com"
}
```

## 7. Validation implemented
- Required fields (`name`, `roll_number`, `department`, `year`, `email`) cannot be blank — enforced both in the HTML form (`required`) and in Django (model + serializer).
- `email` must be a valid email format (Django `EmailField`).
- `roll_number` and `email` must be unique — duplicate values return a `400` with a clear error message, shown in the frontend's message banner.
- `year` must be between 1 and 4 (`MinValueValidator`/`MaxValueValidator`).
- Server-side validation runs even if someone bypasses the browser form (e.g. via Postman).

## 8. Testing procedure
Test each endpoint in Postman (or curl):
1. **Create — valid data:** POST a full valid body → expect `201 Created`.
2. **Create — missing field:** omit `email` → expect `400` with an error message.
3. **Create — duplicate roll number:** POST the same `roll_number` twice → expect `400`.
4. **Read — list:** GET `/api/students/` on an empty DB → expect `200` with an empty list; add records and repeat → expect them listed.
5. **Read — single:** GET `/api/students/{id}/` with a real ID → `200`; with a fake ID (e.g. `9999`) → `404`.
6. **Update — valid:** PUT an existing ID with changed fields → `200`, values reflected on GET.
7. **Update — invalid ID:** PUT `/api/students/9999/` → `404`.
8. **Delete — valid:** DELETE an existing ID → `204`, record gone from the list.
9. **Delete — invalid ID:** DELETE `/api/students/9999/` → `404`.
10. **Frontend responsiveness:** resize the browser / open on a phone — the form stacks above the table below 800px width.
11. **Backend down:** stop the Django server and reload the frontend — the table shows a "could not reach the server" message instead of crashing.

## 9. Challenges and solutions
- **Cross-origin requests** between the frontend (opened as a static file) and
  the backend (a different origin/port) were blocked by the browser by
  default → solved with `django-cors-headers`.
- **Showing validation errors from the API in plain language** → the backend
  returns DRF's standard `{ "field": ["message"] }` shape, and `script.js`
  extracts the first message and displays it in the form's message banner.

## 10. Future enhancements
- Add authentication (login) so only staff can modify records.
- Add pagination controls in the UI (the API already paginates at 50/page).
- Export the student list to CSV/PDF.
- Add course/marks as a related table (one-to-many).

## 11. Git repository
```bash
git init
git add .
git commit -m "Initial commit: Student Management CRUD app"
git remote add origin <your-repo-url>
git push -u origin main
```
Remember `.gitignore` already excludes `db.sqlite3`, `venv/`, and `__pycache__/`.
