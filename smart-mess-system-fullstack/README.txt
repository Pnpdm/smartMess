# Smart Mess Waste Reduction System (Full Stack Demo)

This is a small full‑stack project for your academic demo.

## Structure

- `frontend/` – static HTML, CSS, JS landing page + student/admin/NGO portals.
- `backend/` – Node.js + Express + MongoDB REST API with JWT auth.

## How to run

### 1. Backend

1. Install Node.js and MongoDB on your system.
2. In a terminal:

```bash
cd backend
npm install
cp .env.example .env   # on Windows you can copy the file manually
npm start
```

The API will run on `http://localhost:5000`.

### 2. Frontend

You can simply open `frontend/index.html` in your browser **or** use VS Code "Live Server" extension.

The frontend is already configured to call the backend at `http://localhost:5000/api`.

### 3. Test flow

1. Open `frontend/auth.html`.
2. Signup as:
   - role = `student` (for student portal)
   - role = `admin` (for mess admin portal)
   - role = `ngo` (for NGO portal)
3. Login with that account – you will be redirected to the correct portal.
4. In the student portal, mark today's attendance and save.
5. In the admin portal, open overview and create leftover tickets.
6. In the NGO portal, you will see the donation tickets created by admin.
7. The landing page (`index.html`) will show live numbers from backend (if available), otherwise demo static data.


