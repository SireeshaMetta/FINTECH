# FinGuard AI 🛡️💰

FinGuard AI is an advanced, production-ready AI-Powered FinTech security and expense management ecosystem. The application detects phishing scams, evaluates transaction risk parameters using Generative AI (Gemini), scans physical invoice receipts on-device using OCR, and tracks user budgets through interactive analytics and reports.

---

## 🚀 Key Modules
1. **Scam Detection**: Check SMS, WhatsApp, and Email contents for phishing signals via Gemini AI.
2. **Transaction Risk Analyzer**: Grade specific merchant activities for fraud score and risk weights.
3. **OCR Receipt Scanner**: Process receipts using Tesseract.js directly inside client dashboard.
4. **AI Financial Assistant**: Conversational assistant answering budget questions, providing savings tips, and planning finances.
5. **Expense Tracker & Reporting**: Clean dashboard containing Redux state management, custom categorization, visual analytics, and export formats (PDF & XLSX).

---

## 🛠️ Tech Stack

### Frontend
- **React.js & Vite** - Ultra-fast development server and asset bundler.
- **Tailwind CSS** - Modern custom dark-theme utility and styling.
- **Redux Toolkit** - Global application state persistence.
- **React Router DOM** - Application view routers and route guarding.
- **Framer Motion** - Sleek micro-animations and route transitions.
- **Recharts** - Dynamic data representation.
- **Axios** - Async API connectivity.

### Backend
- **Node.js & Express.js** - Secure RESTful API routing, rate limiting, and MVC controllers.
- **MongoDB Atlas & Mongoose** - Document-level relations, object modeling, and indexes.
- **JWT & bcrypt** - Authorization handling and secure password hashing.
- **Security Middlewares** - `helmet`, `cors`, `express-rate-limit`, `express-validator`.

### Integrations
- **Google Gemini API** (`@google/generative-ai`)
- **Tesseract.js** (OCR scanning)
- **Cloudinary** (profile & receipt uploads)
- **jsPDF** & **SheetJS (XLSX)** (exports)

---

## 📂 Project Structure

```text
client/
  ├── src/
  │    ├── assets/
  │    ├── components/    # PrivateRoute, AdminRoute, Navbar, Sidebar
  │    ├── hooks/
  │    ├── layouts/       # DashboardLayout
  │    ├── pages/         # Login, Register, ForgotPassword, ResetPassword, Dashboard
  │    ├── redux/         # store.js, authSlice.js
  │    ├── services/      # api.js
  │    └── utils/
  ├── vite.config.js
  └── tailwind.config.js
server/
  ├── config/            # db.js (MongoDB)
  ├── controllers/       # authController.js
  ├── middleware/        # auth.js, error.js
  ├── models/            # User.js
  ├── routes/            # authRoutes.js
  ├── server.js          # App entry point
  └── .env.example
docs/
```

---

## ⚙️ Installation & Setup (Phase 1)

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas Connection string)

### 1. Backend Configuration
Navigate to the `server/` directory:
```bash
cd server
npm install
```
Configure environment values in `.env` using `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finguard_ai
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```
Start development server:
```bash
npm run dev
```

### 2. Frontend Configuration
Navigate to the `client/` directory:
```bash
cd ../client
npm install
```
Start client development environment:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the client.

---

## 🔒 API Endpoints - Phase 1 Auth

| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/auth/register` | Register new user account | Public |
| **POST** | `/api/auth/login` | Authenticate user & get JWT token | Public |
| **POST** | `/api/auth/logout` | Log out session | Public |
| **POST** | `/api/auth/forgotpassword` | Request password reset token | Public |
| **PUT** | `/api/auth/resetpassword/:token` | Reset password using token | Public |
| **GET** | `/api/auth/me` | Fetch active user credentials | Private (JWT) |
| **PUT** | `/api/auth/updatedetails` | Update name, email, avatar | Private (JWT) |
| **PUT** | `/api/auth/updatepassword` | Reset password while logged in | Private (JWT) |
| **DELETE** | `/api/auth/deleteaccount` | Permanently delete account | Private (JWT) |
