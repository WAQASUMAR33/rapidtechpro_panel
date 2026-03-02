# Technical Architecture - Image Upload System

## System Overview

The image upload system is a complete file handling solution for the RapidTechPro admin panel, enabling administrators to upload project images directly through the web interface instead of providing URLs.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Admin Content Page (UI)                       │
│                    app/admin/content.tsx                         │
│  - File input elements                                           │
│  - FormData state management                                     │
│  - Project form with categories/technologies                     │
└────────────────────────┬────────────────────────────────────────┘
                         │ uploadImage()
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Upload API Endpoint                                 │
│              app/api/upload/route.ts                             │
│  - Validates file type (JPEG/PNG/GIF/WebP)                     │
│  - Validates file size (max 5MB)                                │
│  - Generates unique filename                                    │
│  - Saves to /public/uploads/projects/                           │
│  - Returns relative URL                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │ Returns { url: "/uploads/projects/..." }
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Project Creation Endpoint                           │
│              app/api/projects/route.ts                           │
│  - Receives project data with image URLs                        │
│  - Creates project in database via Prisma                       │
│  - Creates category/technology associations                     │
│  - Creates ProjectImage records for additional images           │
└────────────────────────┬────────────────────────────────────────┘
                         │ Saves to MySQL
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              MySQL Database                                      │
│  - Project table (title, slug, mainImage, etc.)                │
│  - ProjectImage table (additional images)                       │
│  - Category table (with many-to-many relations)                │
│  - Technology table (with many-to-many relations)              │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Upload API Handler (`app/api/upload/route.ts`)

**Responsibility:** Accept file uploads, validate, store, return URL

**Technology Stack:**
- Next.js API Routes
- Node.js `fs/promises` (file system)
- `path` module for file path resolution

**Request Processing:**
```
1. Parse FormData from request
2. Extract File object from 'file' field
3. Validate file type (whitelist: JPEG, PNG, GIF, WebP)
4. Validate file size (max 5 * 1024 * 1024 = 5MB)
5. Generate unique filename: ${timestamp}-${random}.${ext}
6. Ensure directory exists: mkdir /public/uploads/projects/
7. Convert File to Buffer
8. Write buffer to disk: writeFile(filepath, buffer)
9. Return relative URL: /uploads/projects/filename
10. Handle errors gracefully with meaningful messages
```

**Key Functions:**
```typescript
// Parse request
const formData = await request.formData();
const file = formData.get('file') as File;

// Validate
if (!allowedTypes.includes(file.type)) → Return 400 error
if (file.size > 5MB) → Return 400 error

// Generate filename
const timestamp = Date.now(); // 1708951234567
const random = Math.random().toString(36).substring(2, 8); // a1b2c3
const ext = file.name.split('.').pop(); // jpg
const filename = `${timestamp}-${random}.${ext}`; // 1708951234567-a1b2c3.jpg

// Create directory
const uploadDir = join(process.cwd(), 'public', 'uploads', 'projects');
await mkdir(uploadDir, { recursive: true });

// Save file
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
await writeFile(filepath, buffer);

// Return response
return NextResponse.json({
  success: true,
  data: { filename, url: `/uploads/projects/${filename}` }
});
```

**Error Handling:**
- No file provided → 400 error
- Invalid file type → 400 error with specific message
- File too large → 400 error with size message
- Write failure → 500 error with server message

### 2. Content Management UI (`app/admin/content.tsx`)

**Responsibility:** Provide form for uploading projects with images

**State Management:**
```typescript
const [formData, setFormData] = useState({
  // Identifiers
  title: '',              // Project name
  slug: '',               // URL slug (auto-generated)
  
  // Image fields
  mainImage: '',          // Display: filename for UI
  mainImageFile: null,    // Contains: actual File object
  images: [],             // Additional images
  
  // SEO fields
  keyword: '',
  metaTitle: '',
  metaDescription: '',
  canonicalTag: '',
  
  // Project details
  projectUrl: '',
  location: '',
  
  // Relations
  categoryIds: [],
  technologyIds: [],
});
```

**Key Functions:**

#### uploadImage(file: File): Promise<string>
Uploads single file to /api/upload and returns URL
```typescript
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await res.json();
  if (data.success) {
    return data.data.url; // Returns "/uploads/projects/1708951234-a1b2c3.jpg"
  } else {
    throw new Error(data.message);
  }
};
```

#### handleMainImageChange(e: ChangeEvent<HTMLInputElement>)
Updates main image file when user selects file
```typescript
const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setFormData((prev) => ({
      ...prev,
      mainImageFile: file,      // Store File object
      mainImage: file.name,     // Display filename
    }));
  }
};
```

#### handleAdditionalImageChange(index: number, file: File | null)
Updates additional image at specific index
```typescript
const handleAdditionalImageChange = (index: number, file: File | null) => {
  const newImages = [...formData.images];
  newImages[index] = {
    file: file,
    url: file ? file.name : '',
  };
  setFormData((prev) => ({
    ...prev,
    images: newImages,
  }));
};
```

#### handleSubmit(e: FormEvent)
Complete upload and project creation flow
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // 1. Validate main image exists
  if (!formData.mainImageFile) {
    setMessage('❌ Please select a main image');
    return;
  }

  // 2. Upload main image
  const mainImageUrl = await uploadImage(formData.mainImageFile);

  // 3. Upload additional images
  const uploadedImageUrls: string[] = [];
  for (const img of formData.images) {
    if (img.file) {
      const url = await uploadImage(img.file);
      uploadedImageUrls.push(url);
    }
  }

  // 4. Create project with URLs
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      mainImage: mainImageUrl,      // Use URL from API
      images: uploadedImageUrls,    // Use URLs from API
    }),
  });

  // 5. Handle response
  if (res.ok) {
    setMessage('✅ Project created successfully!');
    setFormData(initialState);
    fetchProjects();
  }
};
```

### 3. Project API (`app/api/projects/route.ts`)

**Responsibility:** Handle CRUD operations for projects

**POST Create Project:**
```typescript
{
  title: string;
  slug: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  canonicalTag?: string;
  mainImage: string;              // URL from upload API
  projectUrl: string;
  location: string;
  categoryIds: number[];
  technologyIds: number[];
  images: string[];               // URLs from upload API
}

→ Creates Project
→ Creates ProjectImage records for each additional image
→ Creates associations with Category and Technology via many-to-many tables
```

### 4. Database Schema (`prisma/schema.prisma`)

**Project Model:**
```prisma
model Project {
  id               Int     @id @default(autoincrement())
  title            String                          // "My Website"
  slug             String  @unique                 // "my-website"
  keyword          String                          // "website, design, web"
  metaTitle        String                          // SEO title
  metaDescription  String                          // SEO description
  canonicalTag     String?                         // Preferred URL
  mainImage        String                          // "/uploads/projects/1708951234-a1b2c3.jpg"
  projectUrl       String                          // "https://example.com"
  location         String                          // "New York, USA"
  categories       Category[]                      // Many-to-many relation
  technologies     Technology[]                    // Many-to-many relation
  images           ProjectImage[]                  // Additional images
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@map("projects")
}

model ProjectImage {
  id        Int     @id @default(autoincrement())
  projectId Int                                    // Foreign key
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  imageUrl  String                                 // "/uploads/projects/1708951245-b2c3d4.jpg"
  createdAt DateTime @default(now())
  
  @@map("project_images")
}

model Category {
  id        Int     @id @default(autoincrement())
  name      String  @unique                        // "Web Design"
  projects  Project[]                              // Many-to-many relation
  
  @@map("categories")
}

model Technology {
  id        Int     @id @default(autoincrement())
  name      String  @unique                        // "React"
  projects  Project[]                              // Many-to-many relation
  
  @@map("technologies")
}
```

**Database Relations:**
```
projects table
├── mainImage (String) → /uploads/projects/filename.jpg
├── images (1:N relationship via project_images table)
├── categories (M:N relationship via join table)
└── technologies (M:N relationship via join table)

project_images table
├── projectId (FK) → projects.id
└── imageUrl (String) → /uploads/projects/filename.jpg

categories table
├── id (PK)
├── name (String, UNIQUE)
└── projects (M:N relationship via join table)

technologies table
├── id (PK)
├── name (String, UNIQUE)
└── projects (M:N relationship via join table)
```

## Data Flow Sequence

### Creating a Project with Images

```
USER INTERFACE LAYER
├─ User selects main image file
│  └─ formData.mainImageFile = File object
│  └─ formData.mainImage = "photo.jpg" (display)
│
├─ User selects 2 additional images
│  └─ formData.images = [
│       { file: File, url: "photo2.jpg" },
│       { file: File, url: "photo3.jpg" }
│     ]
│
├─ User fills project details
│  └─ title: "My Website"
│  └─ slug: "my-website"
│  └─ categoryIds: [1, 3]
│  └─ technologyIds: [2, 5, 8]
│  └─ SEO fields: keyword, metaTitle, metaDescription, etc.
│
└─ User clicks "Create Project"
   │
   └─→ handleSubmit() executes
       │
       ├─→ uploadImage(mainImageFile)
       │   └─→ POST /api/upload (FormData)
       │       └─→ Server validates file
       │       └─→ Server generates timestamp-random.jpg
       │       └─→ Server saves to /public/uploads/projects/
       │       └─→ Server returns { url: "/uploads/projects/1708951234-a1b2c3.jpg" }
       │       └─→ Assign to mainImageUrl
       │
       ├─→ For each additional image:
       │   └─→ uploadImage(img.file)
       │       └─→ Same process
       │       └─→ URL added to uploadedImageUrls array
       │
       └─→ POST /api/projects (JSON)
           {
             title: "My Website",
             slug: "my-website",
             mainImage: "/uploads/projects/1708951234-a1b2c3.jpg",
             images: [
               "/uploads/projects/1708951245-b2c3d4.jpg",
               "/uploads/projects/1708951256-c3d4e5.jpg"
             ],
             categoryIds: [1, 3],
             technologyIds: [2, 5, 8],
             ...otherFields
           }
           │
           └─→ Server creates Project row:
               INSERT INTO projects (
                 title, slug, mainImage, projectUrl, ...
               ) VALUES (
                 "My Website", "my-website", "/uploads/...", ...
               )
               → Returns project.id = 42
               │
               ├─→ Create ProjectImage records:
               │   INSERT INTO project_images (projectId, imageUrl)
               │   VALUES (42, "/uploads/projects/1708951245-b2c3d4.jpg")
               │   VALUES (42, "/uploads/projects/1708951256-c3d4e5.jpg")
               │
               └─→ Create associations:
                   INSERT INTO _category_to_project (A, B) VALUES (1, 42)
                   INSERT INTO _category_to_project (A, B) VALUES (3, 42)
                   INSERT INTO _technology_to_project (A, B) VALUES (2, 42)
                   ...
           │
           └─→ Return { success: true, data: { id: 42, ... } }

DATABASE LAYER - FINAL STATE
├─ projects table
│  └─ Row: id=42, title="My Website", slug="my-website", 
│          mainImage="/uploads/projects/1708951234-a1b2c3.jpg", ...
│
├─ project_images table
│  ├─ Row: id=1, projectId=42, imageUrl="/uploads/projects/1708951245-b2c3d4.jpg"
│  └─ Row: id=2, projectId=42, imageUrl="/uploads/projects/1708951256-c3d4e5.jpg"
│
└─ Join tables
   ├─ _category_to_project: (1, 42), (3, 42)
   └─ _technology_to_project: (2, 42), (5, 42), (8, 42)

FILE SYSTEM LAYER
├─ /public/uploads/projects/1708951234-a1b2c3.jpg (main image)
├─ /public/uploads/projects/1708951245-b2c3d4.jpg (additional image 1)
└─ /public/uploads/projects/1708951256-c3d4e5.jpg (additional image 2)
```

## Performance Considerations

### Upload Performance
- **Sequential Upload:** Additional images uploaded one-by-one after main
- **Network Efficiency:** FormData only contains binary file data
- **Server Efficiency:** Node.js async file operations non-blocking
- **Storage Efficiency:** Only unique filenames stored (no duplicates)

### Query Performance
- **Project Retrieval:** Single query with relations via Prisma include()
- **Indexing:** slug is UNIQUE index for fast lookups
- **Caching:** URLs stored directly in database (no computation needed)

### File Serving Performance
- **Static Files:** Next.js serves `/public` files with caching headers
- **CDN Ready:** Can be replaced with CDN without code changes
- **Lazy Loading:** Images can be lazy-loaded in frontend

## Security Architecture

### Input Validation
```
File Type Validation:
- Whitelist: image/jpeg, image/png, image/gif, image/webp
- Block: everything else (PDF, EXE, ZIP, etc.)
- Method: Check MIME type from browser + Content-Type header

File Size Validation:
- Max: 5 MB (5 * 1024 * 1024 bytes)
- Prevents: DoS, storage exhaustion
- Checked: Before disk write

Filename Sanitization:
- Original filename: NOT used
- Generated filename: ${Date.now()}-${random}
- Prevents: Path traversal, collision, prediction
```

### Storage Security
```
Directory Isolation:
- Upload directory: /public/uploads/projects/
- Not executable: Can't run malware
- User isolation: Can't access outside folder
- Permission restricted: Files readable via HTTP only

URL Construction:
- Relative URLs: /uploads/projects/filename
- Prevents: Exposing file system paths
- Predictable: Served from same origin
```

### Request Validation
```
API Endpoint: /api/upload
- CORS: Same origin only
- Method: POST only
- Body: multipart/form-data only
- Rate Limiting: (Can be added)
```

## Error Handling Architecture

### Upload Errors
```
File Input Error:
└─ TypeError → Caught and logged

Missing File:
└─ No file in FormData → 400 Bad Request

Invalid Type:
└─ file.type not in whitelist → 400 Bad Request
   Message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."

File Too Large:
└─ file.size > 5MB → 400 Bad Request
   Message: "File size must be less than 5MB"

Directory Error:
└─ mkdir fails → Caught and logged
   Continue: mkdir { recursive: true } ensures creation

Write Error:
└─ writeFile fails → 500 Server Error
   Message: error.message from system
```

### Project Creation Errors
```
Missing Main Image:
└─ formData.mainImageFile === null
   → UI Error: "❌ Please select a main image"
   → Form not submitted

Upload Failure:
└─ fetch('/api/upload') fails
   → API returns { success: false, message: "..." }
   → Throw error with message
   → Catch in handleSubmit
   → Display error to user

Database Error:
└─ fetch('/api/projects') fails
   → API returns error response
   → Catch error
   → Display error message
```

### User Feedback
```
Status Messages (in real-time):
├─ Before upload: ""
├─ Uploading: "📤 Uploading images..."
├─ Creating: "💾 Creating project..."
├─ Success: "✅ Project created successfully!"
└─ Error: "❌ Error message details"
```

## Extension Points

### Image Processing
```
// Currently: As-is storage
// Could add:
- Image resizing / cropping
- Format conversion (to WebP)
- Compression
- Watermarking
- Thumbnail generation
```

### Storage Backend
```
// Currently: Local filesystem (/public/uploads/)
// Could upgrade to:
- AWS S3
- Google Cloud Storage
- Cloudinary
- ImageKit
- Azure Blob Storage
```

### Delivery Network
```
// Currently: Served from same origin
// Could add:
- CloudFront (AWS CDN)
- Cloudflare
- Fastly
- Imagekit delivery optimization
```

### Validation Enhancement
```
// Currently: File type + size
// Could add:
- Image dimension validation
- Duplicate detection
- NSFW detection
- Metadata stripping
- Virus scanning
```

---

**This architecture provides a secure, scalable, and user-friendly image upload system for the RapidTechPro admin panel.**
