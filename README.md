# MINDShield — AI Powered Digital Discipline App

This scaffold implements a minimal MERN-style starter focused on the UI you requested:

- Landing page with logo "MINDShield" and a search box asking "What is your problem to fix?"
- Dashboard with cards for: Priorities, Discipline, Other Skills, My life lessons and mistakes, Distraction, Overthinking (Planner)
- Simple Express server serving sections at `/api/sections`

How to run (Windows / PowerShell):


## Server


cd c:\project\MindShied\server

npm install

npm run dev

## ML_Service
cd C:\project\MindShied\server\ml_service

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python app.py

## Client

cd c:\project\MindShied\client

npm install

npm run dev

Open [http://localhost:5173](http://localhost:5173) (Vite) and the landing page will appear. Search will navigate to `/dashboard` and load cards from server.

Next steps:

- Add MongoDB models and persistent storage for sections and user data
- Add authentication (JWT)
- Improve UI with icons, animations, and a layout closer to the Shadboard repo
- Add detail pages for each section and CRUD


## Backend
