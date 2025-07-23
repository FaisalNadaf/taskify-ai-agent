Task Manager - Next.js Priority-Based Task Organizer
Overview
Task Manager is a Next.js application that helps you organize your tasks by automatically categorizing them into High, Medium, and Low priority categories using Gemini AI. The app intelligently analyzes your task descriptions to determine the appropriate priority level, making task management more efficient.

Features
AI-Powered Priority Assignment: Uses Gemini AI to analyze task descriptions and automatically assign priority levels (High/Medium/Low)

Intuitive Task Management: Add, edit, and delete tasks with ease

Priority-Based Organization: Tasks are automatically sorted into priority categories

Responsive Design: Works seamlessly across desktop and mobile devices

Modern UI: Clean, user-friendly interface built with modern Next.js components

Technologies Used
Next.js (App Router)

React.js

Gemini AI API

Tailwind CSS

TypeScript (optional - if used in your project)

[Any other libraries you've used]

Getting Started
Prerequisites
Node.js (v16 or later)

npm or yarn

Google Gemini API key (get it from Google AI Studio)

Installation
Clone the repository:

bash
git clone [repository-url]
cd task-manager
Install dependencies:

bash
npm install
# or
yarn install
Create a .env.local file in the root directory and add your Gemini API key:

env
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key-here
Run the development server:

bash
npm run dev
# or
yarn dev
Open http://localhost:3000 in your browser.

How It Works
Add a Task: Enter your task description in the input field

AI Analysis: The system sends your task description to Gemini AI for priority assessment

Automatic Categorization: Based on the AI's response, your task is placed in:

🔴 High Priority (Urgent and important tasks)

🟡 Medium Priority (Important but not urgent tasks)

🟢 Low Priority (Tasks that can wait)