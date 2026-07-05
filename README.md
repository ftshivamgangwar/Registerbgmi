# BGMI Tournament User Registration Website

A production-ready, highly secure, and polished **BGMI User Registration Portal** built using React + Vite + Firebase. It features Google Sign-In, instant profile creation, duplicate BGMI ID prevention, profile locking (read-only after registration), and a comprehensive Admin Dashboard.

## 🚀 Key Features

*   **Dark Gaming Theme**: Immersive Esports & BGMI inspired UI with glowing accents, optimized responsive layout for mobile-first gamers.
*   **Google Sign-In Authentication**: Instant and secure authentication via Google Popup login.
*   **Unique BGMI ID Verification**: Prevents multiple players registering with duplicate BGMI Character IDs.
*   **Secure Profile Locking**: User profiles are immediately locked down and read-only once registered to ensure the integrity of the tournament bracket.
*   **Robust Admin Panel**: Access restricted strictly to `ftshivamgangwar@gmail.com`. Admins can search players dynamically by BGMI ID or IGN, view complete profile lists, download data as CSV, and instantly initiate contact via pre-formatted WhatsApp or Instagram links.
*   **Bulletproof Firestore Rules**: Strict validation for all input types, length boundaries, and identity matching to avoid shadow fields or unauthorized data access.

---

## 🛠️ Folder Structure

```text
/
├── .env.example             # Template for client-side and server environment variables
├── firebase-blueprint.json  # Database IR for entity schemas and access points
├── firestore.rules          # Production-ready security rules for Firebase
├── index.html               # Main entry HTML
├── package.json             # App dependencies & run scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite Bundler configurations
└── src/
    ├── App.tsx              # Core app controller & routing logic
    ├── firebase.ts          # Firebase connection & global error wrapper
    ├── index.css            # Tailwind configuration & gaming display font rules
    ├── main.tsx             # DOM entry renderer
    ├── types.ts             # TypeScript definitions & data constraints
    └── components/
        ├── FirebaseProvider.tsx  # Global Auth, Profile, and Firestore context
        ├── Navbar.tsx            # Sticky user profile header & admin tab switcher
        ├── RegistrationForm.tsx  # Character ID validating user enrollment form
        ├── ProfileView.tsx       # Locked read-only gamer profile card
        └── AdminDashboard.tsx    # Bracket manager & user database search table
```

---

## 📝 Environment Variables (`.env`)

Create a `.env` file in the root folder with your Firebase configuration. DO NOT check your real keys into source control.

```env
# Firebase Client Credentials
VITE_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="YOUR_DATABASE_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"
```

---

## 🔒 Firebase Firestore Security Rules

Deploy the included `firestore.rules` file to your Firebase console or via the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

These rules enforce:
1.  **Identity Verification**: `request.auth.token.email_verified == true`.
2.  **Strict Write Schemas**: All data is validated for format (numeric BGMI ID, 10-digit WhatsApp number, real name sizes) before matching.
3.  **Owner Isolation**: Users can only access their own document matching `userId == request.auth.uid`.
4.  **Admin Protection**: Only `ftshivamgangwar@gmail.com` can run bulk list queries and search across registered players.
5.  **Immutability**: Once written, updates and deletions are entirely blocked to prevent tampering.

---

## 💻 Local Development Setup

Follow these steps to run the application locally:

### 1. Clone the repository and navigate to the directory:
```bash
git clone <your-repository-url>
cd bgmi-user-registration
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Start the development server:
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 4. Build for production:
```bash
npm run build
```

---

## ☁️ Deployment

### 1. Deploy to Vercel
1. Install Vercel CLI or import the GitHub repository in the Vercel Dashboard.
2. In the Vercel Dashboard, add all key variables from `.env` in the **Environment Variables** section.
3. Deploy! Vercel automatically detects the Vite config and hosts the compiled build securely.

### 2. Deploy to GitHub Pages
1. Ensure your `vite.config.ts` includes the correct `base` path if deploying under a subpath.
2. Build and push the static files inside the `dist/` folder.
