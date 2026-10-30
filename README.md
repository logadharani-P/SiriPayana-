# 🌿 SiriPayana – AI-Powered Karnataka Travel Planner

<p align="center">
  <strong>Discover Karnataka. Plan Smarter. Travel Better.</strong>
</p>

<p align="center">
  An AI-powered travel planning platform designed to make exploring Karnataka easier, smarter, and more accessible.
</p>

<p align="center">
  <a href="https://siri-payana-mzp3.vercel.app/">Live Website</a>
</p>

---

## 📌 About the Project

**SiriPayana** is an AI-powered travel planning web application that helps users discover tourist destinations across Karnataka and organize their trips through a centralized platform.

Karnataka offers a wide range of attractions, including historical monuments, hill stations, waterfalls, beaches, wildlife sanctuaries, and cultural destinations. However, finding destination information, planning routes, exploring travel options, and estimating expenses across multiple platforms can be time-consuming.

SiriPayana aims to simplify this process by bringing destination discovery, itinerary planning, transportation exploration, accommodation planning, and budget estimation together in one platform.

## 🎯 Objectives

- Simplify travel planning across Karnataka.
- Help users discover destinations based on their interests.
- Organize destinations according to Karnataka's geographical regions.
- Support multi-destination itinerary planning.
- Provide an organized overview of estimated travel expenses.
- Improve accessibility through multilingual support.
- Explore the use of AI in personalized travel planning.

## ✨ Key Features

### 1. Regional Destination Exploration
- Explore tourist destinations across Karnataka.
- Discover places organized into four geographical regions.
- View destination information and photographs.
- Search and filter destinations.

### 2. AI-Assisted Travel Planning
- Support personalized travel recommendations.
- Help users explore destinations based on their preferences.
- Make travel discovery more convenient.

### 3. Multi-Destination Itinerary
- Select multiple destinations.
- Organize selected places into a trip.
- Review and manage the planned destinations.

### 4. Transportation & Accommodation
- Explore transportation options.
- View accommodation information.
- Organize travel-related requirements in one place.

### 5. Budget Estimation
- Review estimated transportation expenses.
- Include accommodation costs.
- Account for applicable entry fees and other expenses.
- View an itemized trip budget.

### 6. Multilingual Experience
- Support language switching through the internationalization system.
- Provide a localized interface for a wider range of users.

### 7. Digital Travel Pass
- Generate a downloadable PDF containing trip information.
- Organize itinerary details and relevant booking references.
- Present travel information in a convenient document.

**Note:** A generated travel pass is not an official transport ticket or attraction entry ticket unless issued or confirmed by the respective provider. Estimated costs and unconfirmed bookings should be clearly identified.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 18 |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Styling | CSS Custom Properties |
| Animations | Framer Motion |
| Routing | React Router v6 |
| State Management | React Context API, useReducer |
| Maps | Leaflet, OpenStreetMap |
| Authentication | Supabase |
| AI Integration | Google Gemini API |
| Internationalization | i18next, react-i18next |
| Demo Storage | LocalStorage |
| Production Backend | Supabase |
| Deployment | Vercel |

## ⚙️ Application Workflow

1. **Sign In:** Users access the application through the authentication interface.
2. **Onboarding:** Users provide their travel preferences.
3. **Explore Karnataka:** Users select a geographical region.
4. **Discover Destinations:** Users browse and select multiple destinations.
5. **Plan the Journey:** Users organize their itinerary and explore transportation options.
6. **Accommodation:** Users explore suitable accommodation options.
7. **Review Budget:** Users view the estimated expenses for their trip.
8. **Complete Booking:** Booking and payment depend on the availability of verified provider integrations.
9. **Generate Travel Pass:** Users can access a downloadable document containing their trip details and applicable references.

## 🗺️ Project Highlights

- Karnataka-focused destination discovery.
- AI-assisted travel planning.
- Interactive map integration.
- Multi-destination trip organization.
- Itemized travel budget estimation.
- Multilingual application architecture.
- Responsive web application.
- Downloadable PDF travel documentation.

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

### 2. Navigate to the Project Directory

```bash
cd siri-payana
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and configure the required credentials for:

- Supabase authentication and backend services.
- Google Gemini API integration.

Use the environment variable names expected by the existing application. Refer to the project's environment configuration or `.env.example` file.

**Important:** Never upload API keys, passwords, or private credentials to GitHub.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### 6. Build for Production

```bash
npm run build
```

To preview the production build, run:

```bash
npm run preview
```

## 📂 Project Structure

The application follows a modular React architecture. A typical organization is:

```text
siri-payana/
│
├── public/
│   └── assets/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── i18n/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

*The structure above is illustrative. Refer to the actual repository for the current folder and file names.*

## 🔮 Future Scope

- Real-time transportation booking integrations.
- Verified hotel reservation services.
- Advanced AI-powered itinerary recommendations.
- Live weather and travel updates.
- Improved route optimization.
- Expanded regional language support.
- More destination coverage across Karnataka.
- Integration with verified tourism and travel service providers.

## 🌱 Expected Impact

SiriPayana aims to make Karnataka tourism more accessible by simplifying travel discovery and trip organization.

The platform can help travelers save planning time, understand estimated expenses, explore lesser-known destinations, and organize their journeys more effectively.

## 👩‍💻 Project Information

**Project Name:** SiriPayana

**Category:** AI-Powered Travel & Tourism

**Domain:** Web Development | Artificial Intelligence | Travel Technology

**Live Demo:** https://siri-payana-mzp3.vercel.app/

**Developed By:** Logadharani P

**Department:** B.Tech.,AI&DS

**Institution:** VSB Engineering college

---

<p align="center">
  <strong>Explore Karnataka with SiriPayana 🌿</strong>
  <br/>
  <em>Discover More. Travel Better.</em>
</p>
