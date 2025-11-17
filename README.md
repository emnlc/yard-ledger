# Yard Ledger

An invoice management system to track and generate pdf files for clients, built with React and TypeScript. Built at first for my dads landscaping company.

[Live Site](https://yardledger.web.app/)

**Test Account:**
- `demo@email.com`
- `Password123-`

## 🛠️ Technologies

- `React`
- `TypeScript`
- `Node`
- `Tailwind CSS`
- `Firebase`
- `react-pdf/renderer`

## ✨ Features

- Client management with invoice history tracking
- Create and edit invoice line items with automatic price calculations
- Export invoices as PDFs for emailing to clients or printing for records
- Persistent records of all past invoices and pricing data

## 💡 Why I Built This

This project was primarily intended for my dads landscaping company. My sister, my dad, and myself would manually create each invoice from my dads notebook, this would result in long nights passing the journal between one another. With Yard Ledger, my dad can now keep track of client invoice details in a digital system while he works. When invoices need to be generated we just do a quick check to ensure the details are correct before sending them out.

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js 18.x or higher
- Firebase Account
#### Firebase Setup
1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password and Google) and **Realtime Database** in your project
3. Click "Add app" and select the Web platform (</> icon)
4. Register your app and copy the Firebase configuration code
5. Create `src/firebase/firebase-config.ts` and paste the configuration code:
```typescript
// EXAMPLE FILE
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
// MAKE SURE TO EXPORT
export const app = initializeApp(firebaseConfig);
```

## 🚀 Running the Project
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📸 Preview

<video width="630" height="300" src="https://github.com/user-attachments/assets/286e26f7-4f16-4c30-aa74-23fdf7c49def"></video>
