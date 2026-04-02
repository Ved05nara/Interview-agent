# AI Interview Preparation Agent

An AI-powered Interview Preparation Agent built using **HTML, CSS, JavaScript, n8n, and Groq LLM**.  
This project helps users prepare for interviews by generating **dynamic questions and tips** based on the selected **job role**, **interview round**, and optionally a **resume upload**.

## Features

- Generate interview questions based on job role
- Multiple interview modes:
  - General Interview Questions
  - Coding Round
  - Aptitude Round
  - Resume-Based Questions
- Resume upload support (PDF / DOCX)
- Dynamic AI responses using Groq LLM
- n8n webhook-based workflow integration
- Clean frontend UI for user interaction

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Workflow Automation:** n8n
- **LLM Provider:** Groq
- **API Communication:** Webhook-based integration

## Project Structure

```bash
interview-agent/
│
├── index.html
├── style.css
├── script.js
├── config.js
├── .env.example
├── .gitignore
└── Interview-agent.json


## How it works

1. The user enters a job role and selects an interview mode.
2. Optionally, the user uploads a resume.
3. The frontend sends the input to an n8n webhook.
4. n8n processes the request and passes it to the Groq LLM.
5. The AI generates relevant interview questions and preparation tips.
6. The response is returned to the frontend and displayed in a structured format.


## Supported interview modes:
# General Interview Questions
Generates technical and HR-style questions.
# Coding Round
Generates coding problems and related interview preparation content.
# Aptitude Round
Generates logical reasoning and quantitative aptitude questions.
# Resume-Based Questions
Generates personalized questions based on resume content.
# Resume-Based Questions
Generates personalized questions based on resume content.
