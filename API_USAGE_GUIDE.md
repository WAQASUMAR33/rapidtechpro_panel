# RapidTechPro API Usage Guide

This guide explains how to use the secured API endpoints from RapidTechPro in your other projects.

## 1. Authentication

Every request to the API must include the `x-api-key` header for authentication. 

- **Header Name:** `x-api-key`
- **Header Value:** `rapidtech_secret_key_2026`

> [!IMPORTANT]
> Keep this key secret. In production, you should store this in an environment variable (`.env`) and never hardcode it in your client-side code if possible.

## 2. Base Configuration

- **Development URL:** `http://localhost:3001` (Your local server is currently running on port 3001)
- **Production URL:** `https://your-deployed-domain.com`

## 3. Available Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/projects` | GET | List all projects with nested categories and technologies |
| `/api/projects/[id]` | GET | Fetch details for a specific project |
| `/api/categories` | GET | List all available categories |
| `/api/technologies` | GET | List all available technologies |

## 4. CORS & Preflight Handling

The API is configured with a global middleware that handles **CORS (Cross-Origin Resource Sharing)**.

- **Allowed Origin:** `*` (Allows requests from any domain)
- **Allowed Methods:** `GET, POST, PUT, DELETE, OPTIONS`
- **Preflight (OPTIONS):** Automatically handled with a `200 OK` status (fixing common `204` issues in some browsers).

## 5. Code Examples

### JavaScript (Fetch API)

```javascript
const API_URL = 'http://localhost:3001/api/projects';
const API_KEY = 'rapidtech_secret_key_2026';

async function getProjects() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const projects = await response.json();
    console.log(projects);
    return projects;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
}
```

### React (with useEffect)

```tsx
import { useEffect, useState } from 'react';

export function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/projects', {
      headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
    })
    .then(res => res.json())
    .then(data => setProjects(data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {projects.map(p => <div key={p.id}>{p.title}</div>)}
    </div>
  );
}
```

## 6. Troubleshooting

1.  **401 Unauthorized**: 
    - Verify `x-api-key` header matches `rapidtech_secret_key_2026`.
    - Ensure your server is running on port 3001.
2.  **Network Error / CORS**:
    - The server must be running. Check your terminal for `npm run dev`.
    - If testing from a browser, ensure you are including the `x-api-key` in the headers.
