# SmartLedger Frontend

A modern, premium business management system built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- 📊 **Dashboard**: Real-time business insights, financial summaries, and low-stock alerts
- 📦 **Products**: Complete inventory management with stock adjustments
- ✅ **Tasks**: Todo and task management
- 🏦 **Accounts**: Chart of accounts management
- 📒 **Journal Entries**: Record and approve financial transactions
- 📈 **Reports**: Income statements, balance sheets, and more
- 📉 **Analytics**: Data visualization and business analytics

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios
- **State Management**: React Context API
- **JWT Handling**: jwt-decode

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd smartledger-frontend-new
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:

   Create a `.env.local` file in the root directory with your backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=https://smartledger-api-o7hy.onrender.com/api
   ```

### Running the App

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

### Linting & Type Checking

```bash
npm run lint
```

## Project Structure

```
smartledger-frontend-new/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── tasks/
│   │   ├── accounts/
│   │   ├── journal/
│   │   ├── reports/
│   │   ├── analytics/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   └── layout/
│   ├── context/
│   │   └── AuthContext.tsx
│   └── services/
│       └── api.ts
├── .env.local
├── next.config.ts
├── package.json
└── README.md
```

## Backend API

The frontend connects to the SmartLedger backend API at: https://smartledger-api-o7hy.onrender.com

Swagger documentation is available at: https://smartledger-api-o7hy.onrender.com/swagger/index.html

## Usage

1. **Register an Account**: Go to `/register` to create a new account
2. **Log In**: Sign in with your credentials at `/login`
3. **Explore Features**: Navigate through the dashboard and other sections using the navbar

## Features Breakdown

### Dashboard
- Overview of products, inventory value, expected revenue, and pending tasks
- Financial summary (income, expenses, net profit, profit margin)
- Low stock alerts

### Products
- Create, edit, and delete products
- Adjust inventory levels (increase/decrease)
- Track low stock items

### Tasks
- Todo list management
- Mark tasks as in progress or completed

### Accounts
- Manage chart of accounts
- Add, edit, delete accounts

### Journal Entries
- Record financial transactions with line items
- Approve journal entries
- View detailed entry information

### Reports
- Income Statement
- Balance Sheet
- Trial Balance
- Inventory Summary
- Sales Reports
- Expenses Reports

### Analytics
- Data visualizations for business insights

## License

MIT
