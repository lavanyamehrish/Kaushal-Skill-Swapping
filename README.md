<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:8b5cf6&height=180&section=header&text=Project%20Kaushal&fontSize=40&fontColor=ffffff" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=500&size=22&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=Skill-Swapping+Platform;Smart+Matching+Algorithm;Real-Time+Collaboration;Full-Stack+Monorepo+Architecture" />
</p>

---

## 🚀 Overview

**Project Kaushal** is a full-stack skill-exchange platform that intelligently connects users based on what they can teach and what they want to learn.

It combines:

- 🎯 Smart compatibility matching  
- 🎥 Real-time video collaboration  
- 💬 Live chat  
- 🎨 Interactive whiteboard  
- 🔐 Secure authentication  

Built with scalable architecture and production-ready practices.

---

## 🛠 Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![ZegoCloud](https://img.shields.io/badge/ZegoCloud-4F46E5?style=flat)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Firestore](https://img.shields.io/badge/Firestore-FFCA28?style=flat&logo=firebase&logoColor=black)

---

## ✨ Core Features

### 🔹 Smart Skill Matching
Custom backend algorithm based on:
- Skill overlap  
- Priority weighting  
- Availability  
- Location (optional)

Users receive ranked compatibility scores.

---

### 🔹 Real-Time Collaboration
- HD Video Calling  
- In-call Chat  
- Interactive Whiteboard  

Powered by ZegoCloud SDK.

---

### 🔹 Secure Architecture
- Firebase Authentication  
- Server-side token validation  
- Firestore database  
- Environment-based configuration  

---

## 🏗 Architecture

```mermaid
flowchart LR
    A[React Frontend] -->|API Calls| B[Express Backend]
    B --> C[Firestore]
    A --> D[Firebase Auth]
    A --> E[ZegoCloud SDK]
