# AI Prompt Log - Emerald E-Commerce Platform

This file documents all development prompts and their results during the creation of the Emerald E-Commerce Platform. This log demonstrates AI-assisted development (vibe coding) as permitted by the assessment.

---

## Project Overview

**Platform:** Full-stack e-commerce application  
**Frontend:** Next.js 16 App Router + TypeScript + Tailwind CSS  
**Backend:** Node.js + Express.js + TypeScript + MongoDB (Mongoose)  
**Authentication:** JWT + bcrypt + Google OAuth (Firebase)  
**Key Features:** Product management, shopping cart, atomic order processing, admin dashboard, reports

---

## Development Phases

### Phase 1: Project Initialization

**Prompt:** "Build a complete, production-ready full-stack e-commerce platform with Next.js 16 App Router + TypeScript + Tailwind CSS for the frontend, and Node.js + Express.js + TypeScript + MongoDB with Mongoose for the backend. Include JWT-based authentication with user/admin roles, comprehensive product management, shopping cart, atomic order processing, and admin reports."

**Result:** AI initialized the project structure, configured TypeScript for both frontend/backend, set up Mongoose models (User, Product, Cart, Order), created Express server with CORS and middleware, and established the foundation for the monorepo architecture.

---

### Phase 2: Backend Development

**Prompt:** "Implement all backend routes and controllers for authentication, products, cart, orders, reports, and admin functionalities."

**Result:** Created controllers:
- `authController.ts` - register, login, googleLogin with JWT token generation
- `productController.ts` - CRUD with search, filter, pagination
- `cartController.ts` - add, view, remove items with quantity validation
- `orderController.ts` - atomic order placement with Mongoose transactions
- `reportController.ts` - MongoDB aggregation for revenue/orders/top products
- `userController.ts` - admin user management

**Prompt:** "Hardcode role: 'user' in register function and add input validation for register, login, and createProduct."

**Result:** Security fix applied - user role is now hardcoded to prevent privilege escalation. Input validation added for email format, password length (min 6 chars), and required fields.

---

### Phase 3: Testing & Docker

**Prompt:** "Write backend tests for authentication, products, and orders using Jest, Supertest, and mongodb-memory-server. Create a multi-stage Dockerfile for the backend."

**Result:** Created test files:
- `auth.test.ts` - register/login validation tests
- `product.test.ts` - CRUD with auth guards
- `order.test.ts` - atomic transactions, stock deduction, cart clearing
- `setup.ts` - in-memory MongoDB configuration

Dockerfile configured with multi-stage build for production optimization.

---

### Phase 4: Frontend Pages

**Prompt:** "Develop the frontend pages for login, product listing, shopping cart, homepage, and admin dashboard."

**Result:** Implemented all pages:
- `login/page.tsx` - Email/password + Google OAuth login
- `register/page.tsx` - User registration with validation
- `products/page.tsx` - Product listing with search, filter, sort, pagination
- `products/[id]/page.tsx` - Product detail page
- `cart/page.tsx` - Shopping cart with quantity management
- `page.tsx` - Homepage with hero section and featured products
- `admin/page.tsx` - Admin dashboard with reports and management

---

### Phase 5: Bug Fixes & Improvements

**Prompt:** "Fix Dockerfile CMD from dist/server.ts to dist/server.js."

**Result:** Corrected Dockerfile to use compiled JavaScript instead of TypeScript source.

**Prompt:** "Fix Navbar handleLogout to add localStorage.removeItem('role') and login page to add localStorage.setItem('role', data.role)."

**Result:** Fixed role persistence in localStorage for proper admin/user session handling.

**Prompt:** "Fix Google login 500 error - 'next is not a function' in User model pre-save hook."

**Result:** Fixed Mongoose middleware bug - removed `next()` callback from async `pre('save')` hook. Also removed manual bcrypt hashing in `googleLogin` controller since the model hook handles it.

**Prompt:** "Create .env file for backend - it's missing."

**Result:** Created `backend/.env` with MongoDB connection, JWT secret, and port configuration.

---

### Phase 6: Authentication State Management

**Prompt:** "After login, navbar still shows login button. Fix authentication state management."

**Result:** Created `AuthContext.tsx` for global auth state management. Updated:
- `layout.tsx` - Wrapped app with AuthProvider
- `Navbar.tsx` - Uses useAuth() hook instead of local state
- `login/page.tsx` & `register/page.tsx` - Use login() from context
- Removed redundant localStorage calls and router.refresh()

---

### Phase 7: UI/UX Improvements

**Prompt:** "Add profile icon as dropdown menu in navbar with Profile link, Admin Dashboard (for admin), and Logout button."

**Result:** Implemented dropdown menu with:
- User avatar or initial letter
- User name and email display
- Profile link (all users)
- Admin Dashboard link (admin only)
- Logout button

**Prompt:** "Add cart icon with item count badge on the right side of navbar."

**Result:** Added functional cart icon that:
- Fetches cart count on mount
- Displays badge with item count (1-9 or "9+")
- Auto-updates via custom event system when cart changes
- Links to cart page

**Prompt:** "Remove 'Create Account' button from homepage hero for logged-in users."

**Result:** Simplified hero section to single "Shop Now" button for all users.

---

### Phase 8: Database & Security

**Prompt:** "Use MongoDB Atlas connection string and seed admin user to cloud database."

**Result:** Updated `backend/.env` with MongoDB Atlas connection. Created `seed.ts` script to create admin user:
- Email: `admin@example.com`
- Password: `password123`

**Prompt:** "Generate secure JWT_SECRET and update .env file."

**Result:** Generated 256-character cryptographically secure JWT secret using Node.js crypto module.

**Prompt:** "Remove real Firebase credentials from .env.local.example and use placeholders."

**Result:** Replaced actual Firebase keys with placeholders in example file. Real credentials remain in `.env.local` (gitignored).

---

### Phase 9: Git & Version Control

**Prompt:** "Check if project is ready to push to GitHub - verify .gitignore configuration."

**Result:** Verified monorepo .gitignore setup:
- `backend/.gitignore` ignores `.env`, `node_modules`, `dist`
- `frontend/.gitignore` ignores `.env.local`, `node_modules`, `.next`
- Confirmed sensitive files are properly excluded from version control

---

## Final Project Structure

```
ecommerce-assessment/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Auth, Product, Cart, Order, Report, User
│   │   ├── models/          # User, Product, Cart, Order (Mongoose schemas)
│   │   ├── middleware/      # JWT auth, admin role guards
│   │   ├── routes/          # API route definitions
│   │   ├── config/          # Database connection
│   │   ├── server.ts        # Express app entry
│   │   └── seed.ts          # Admin user seeder
│   ├── tests/               # Jest + Supertest + mongodb-memory-server
│   ├── .env                 # Environment variables (gitignored)
│   ├── .env.example         # Template
│   ├── Dockerfile           # Multi-stage production build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI (Navbar, ProductCard, etc.)
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── lib/             # API client, Firebase config
│   │   └── types/           # TypeScript interfaces
│   ├── .env.local           # Environment variables (gitignored)
│   ├── .env.local.example   # Template with placeholders
│   └── package.json
├── AI_PROMPT_LOG.md         # This file
├── README.md                # Full documentation
├── postman_collection.json  # API testing collection
└── .gitignore               # Root gitignore (monorepo)
```

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Mongoose pre-save hook for password hashing | DRY principle - single source of truth |
| Async/await without next() in middleware | Mongoose v5+ best practice |
| AuthContext for global state | React best practice, avoids prop drilling |
| Custom event for cart updates | Cross-component communication without context |
| MongoDB transactions for orders | Atomic stock deduction + order creation |
| Role hardcoded to 'user' in register | Security - prevents privilege escalation |
| JWT in localStorage | Simplicity for this assessment scope |
| Firebase for Google OAuth | Industry standard, reduces custom auth complexity |

---

## Testing Coverage

- **Auth:** Registration validation, duplicate email, login success/failure
- **Products:** CRUD operations, admin/user/no-token authorization
- **Orders:** Successful placement, stock deduction, insufficient stock error, cart clearing
- **Cart:** Add items, quantity merge, remove items, stock ceiling enforcement

---

## Security Measures Implemented

1. Password hashing with bcrypt (salt rounds: 10)
2. JWT token authentication with 30-day expiration
3. Role-based access control middleware
4. Input validation on all auth endpoints
5. User role hardcoded to prevent escalation
6. Environment variables for secrets (never committed)
7. CORS configured for frontend origin
8. MongoDB connection string in .env only

---

## AI-Assisted Development Summary

This project was built using AI-assisted development (vibe coding) as permitted by the assessment guidelines. AI tools helped with:

- **Code generation:** Boilerplate, controllers, components
- **Debugging:** Identifying and fixing the Mongoose middleware bug
- **Architecture:** Database schema design, transaction logic
- **Best practices:** TypeScript types, error handling, security patterns
- **Documentation:** README, API docs, prompt logging

All code was reviewed, tested, and validated by the developer before commit.

