# 0. User Stories and Mockups

## Must Have
- As a tourist, I want to register/login so that I can book guides.
- As a guide, I want to register so that I can offer my services.
- As an admin, I want to approve/reject guides so that only verified guides appear.
- As a tourist, I want to browse places so that I can explore options before booking.

## Should Have
- As a tourist, I want to leave reviews so that others benefit from my feedback.

## Could Have
- As a guide, I want to upload multiple images/videos.

## Won’t Have
- Real-time chat (not in MVP).

# 1. System Architecture

## High-Level Components
- **Frontend**: Next.js web interface (React-based).
- **Backend**: Python + Django REST Framework (DRF).
- **Database**: MySQL relational database.
- **External API (if applicable)**: Optional future integrations (e.g., payment gateway, maps API).

## Data Flow
Admin / Guide / Tourist → Frontend (Next.js) → Backend (Django REST API) → Database (MySQL) → Response → User

## Diagram
![System Architecture](System%20Architecture.drawio.png)
