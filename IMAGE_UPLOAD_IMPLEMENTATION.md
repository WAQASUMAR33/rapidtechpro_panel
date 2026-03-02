# Image Upload System - Implementation Guide

## Overview
The admin panel now includes a complete file upload system for project images. Instead of providing image URLs, administrators can upload image files directly through the content management interface.

## System Architecture

### 1. File Upload Endpoint
**Location:** `app/api/upload/route.ts`

**Functionality:**
- Accepts multipart file uploads via `POST /api/upload`
- Validates file type (JPEG, PNG, GIF, WebP only)
- Validates file size (max 5MB)
- Stores files in `/public/uploads/projects/` directory
- Generates unique filenames with timestamp and random string
- Returns relative URL for use in database

**Request:**
```
POST /api/upload
Content-Type: multipart/form-data

file: <File>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "1708951234-a1b2c3.jpg",
    "url": "/uploads/projects/1708951234-a1b2c3.jpg"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
}
```

### 2. Content Management Form
**Location:** `app/admin/content.tsx`

**Key Components:**

#### FormData State Structure:
```typescript
{
  title: string;
  slug: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  canonicalTag: string;
  mainImage: string;              // Display filename
  mainImageFile: File | null;     // Actual file object
  projectUrl: string;
  location: string;
  categoryIds: number[];
  technologyIds: number[];
  images: Array<{
    file: File | null;            // Additional image file
    url: string;                  // Display filename
  }>;
}
```

#### Upload Helper Function:
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
    return data.data.url;
  } else {
    throw new Error(data.message || 'Upload failed');
  }
};
```

#### Event Handlers:

**handleMainImageChange** - Updates main image file and display name
```typescript
const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setFormData((prev) => ({
      ...prev,
      mainImageFile: file,
      mainImage: file.name,
    }));
  }
};
```

**handleAdditionalImageChange** - Updates additional image files
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

### 3. Project Creation Flow

**Sequence:**
1. User selects main image file
2. User (optionally) adds additional image files
3. User fills in project details (title, slug, SEO fields, categories, tech)
4. User clicks "Create Project"
5. System uploads main image → gets URL
6. System uploads each additional image → gets URLs
7. System creates project in database with all returned image URLs
8. Form resets on success

**Code:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  try {
    // Validate main image
    if (!formData.mainImageFile) {
      setMessage('❌ Please select a main image');
      setLoading(false);
      return;
    }

    setMessage('📤 Uploading images...');
    
    // Upload main image
    const mainImageUrl = await uploadImage(formData.mainImageFile);

    // Upload additional images
    const uploadedImageUrls: string[] = [];
    for (const img of formData.images) {
      if (img.file) {
        const url = await uploadImage(img.file);
        uploadedImageUrls.push(url);
      }
    }

    setMessage('💾 Creating project...');

    // Create project with uploaded URLs
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        slug: formData.slug,
        keyword: formData.keyword,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        canonicalTag: formData.canonicalTag,
        mainImage: mainImageUrl,
        projectUrl: formData.projectUrl,
        location: formData.location,
        categoryIds: formData.categoryIds,
        technologyIds: formData.technologyIds,
        images: uploadedImageUrls,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage('✅ Project created successfully!');
      // Reset form
      setFormData({...initialState});
      setShowForm(false);
      fetchProjects();
    } else {
      setMessage(`❌ ${data.message}`);
    }
  } catch (error) {
    setMessage(`❌ Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

## Database Schema

### Project Model
```prisma
model Project {
  id               Int     @id @default(autoincrement())
  title            String
  slug             String  @unique
  keyword          String
  metaTitle        String
  metaDescription  String
  canonicalTag     String?
  mainImage        String        // Stores URL like "/uploads/projects/1708951234-a1b2c3.jpg"
  projectUrl       String
  location         String
  categories       Category[]    // Many-to-many relation
  technologies     Technology[]  // Many-to-many relation
  images           ProjectImage[] // Additional images
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("projects")
}

model ProjectImage {
  id        Int     @id @default(autoincrement())
  projectId Int
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  imageUrl  String  // Stores URL like "/uploads/projects/1708951234-a1b2c3.jpg"
  createdAt DateTime @default(now())

  @@map("project_images")
}
```

## File Storage

### Directory Structure
```
public/
  uploads/
    projects/
      1708951234-a1b2c3.jpg
      1708951245-b2c3d4.png
      1708951256-c3d4e5.gif
      .gitkeep
```

### File Naming Convention
- Format: `{timestamp}-{random}.{extension}`
- Example: `1708951234-a1b2c3.jpg`
- Timestamp: Unix time in milliseconds (Date.now())
- Random: 6-character random string (Math.random().toString(36).substring(2, 8))
- Extension: Extracted from original filename

## Usage Guide

### Adding a New Project

1. **Navigate to Admin Dashboard**
   - Go to http://localhost:3000
   - Dashboard loads directly (login skipped)

2. **Click "Content" in Sidebar**
   - Opens content management interface

3. **Click "Add New Project" Button**
   - Reveals project creation form

4. **Fill in Project Details:**
   - **Title** (required) - Project name
   - **Slug** - Auto-generated from title (editable)
   - **Project URL** (required) - Link to project
   - **Location** - Project location
   - **Main Image** (required) - Click to select image file
   - **Categories** - Check relevant categories
   - **Technologies** - Check relevant technologies

5. **Add SEO Information:**
   - **Keywords** - Comma-separated keywords
   - **Meta Title** - For search engines
   - **Meta Description** - For search engine snippets
   - **Canonical Tag** - Preferred URL version

6. **Add Additional Images:**
   - Click "+ Add Image" button
   - Select image files
   - Remove images with "Remove" button

7. **Submit Form**
   - Click "Create Project"
   - Watch status messages for upload progress
   - Form resets on success
   - Project appears in list below

### Editing/Deleting Projects

**View Projects:**
- Scroll down to see all projects in table format
- Shows: Title, Slug, Categories, Technologies, Created/Updated dates

**Delete Project:**
- Click delete icon next to project
- Project and all related images removed

**Edit Project:**
- Click edit icon to modify project details
- (Edit functionality implemented in API - UI pending)

## API Endpoints

### Upload Endpoint
- **POST** `/api/upload`
- **Request:** FormData with 'file' field
- **Response:** JSON with success status and URL

### Project Endpoints
- **GET** `/api/projects` - List all projects
- **POST** `/api/projects` - Create new project
- **PUT** `/api/projects/{id}` - Update project
- **DELETE** `/api/projects/{id}` - Delete project

### Category Endpoints
- **GET** `/api/categories` - List all categories
- **POST** `/api/categories` - Create category

### Technology Endpoints
- **GET** `/api/technologies` - List all technologies
- **POST** `/api/technologies` - Create technology

## Validation Rules

### File Upload
- **Allowed Types:** JPEG, PNG, GIF, WebP
- **Max Size:** 5MB
- **Required:** At least main image

### Project Form
- **Title:** Required, string
- **Slug:** Required, unique, auto-generated from title
- **Project URL:** Required, valid URL format
- **Main Image:** Required, valid image file
- **Categories:** Optional, can select multiple
- **Technologies:** Optional, can select multiple
- **Additional Images:** Optional, any number

## Error Handling

### Upload Errors
- Invalid file type → "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
- File too large → "File size must be less than 5MB"
- No file selected → "No file provided"
- Server error → "Failed to upload image"

### Project Creation Errors
- Missing required field → "Field required" message
- Duplicate slug → Database constraint error
- Upload failure → Upload error message
- Network error → Catch and display error

## Security Considerations

1. **File Type Validation**
   - Whitelist: image/jpeg, image/png, image/gif, image/webp
   - Rejects: executable, documents, archives, etc.

2. **File Size Validation**
   - Max 5MB limit prevents large uploads
   - Protects server storage

3. **Filename Sanitization**
   - Original filename not used
   - Generated unique names prevent collisions
   - Random component prevents prediction

4. **Directory Isolation**
   - All uploads to `/public/uploads/projects/`
   - Not executable directory
   - User cannot access outside this folder

## Performance Features

1. **Async Upload**
   - Non-blocking file operations
   - Multiple images upload sequentially
   - Status messages inform user of progress

2. **Optimized Storage**
   - Unique filenames prevent overwrites
   - Original filename discarded (saves space)
   - Static files served efficiently from `/public`

3. **Database Efficiency**
   - Main image URL stored directly in Project
   - Additional images in separate ProjectImage table
   - Many-to-many relations for categories/technologies

## Troubleshooting

### Images Not Uploading
1. Check file format (JPEG, PNG, GIF, WebP only)
2. Check file size (max 5MB)
3. Verify `/public/uploads/projects/` directory exists
4. Check browser console for error messages

### Images Not Displaying
1. Verify image URL saved correctly in database
2. Check `/public/uploads/projects/` directory for files
3. Verify file permissions allow reading
4. Test direct access: http://localhost:3000/uploads/projects/{filename}

### Database Errors
1. Run `npx prisma db push` to sync schema
2. Check DATABASE_URL in `.env.local`
3. Verify MySQL server is running
4. Check database and tables created successfully

## Environment Configuration

**Required Variables in `.env.local`:**
```
DATABASE_URL="mysql://root:@localhost:3306/rapidtechpro_admin"
```

**Directory Creation:**
```
/public/uploads/projects/
```

## Future Enhancements

1. **Image Cropping** - Allow resizing before upload
2. **Thumbnails** - Auto-generate thumbnails for gallery
3. **Optimized Images** - Compress images on upload
4. **CDN Integration** - Store images on external CDN
5. **Lazy Loading** - Load images as needed
6. **Image Gallery** - Display uploadedimages with lightbox
7. **Batch Upload** - Upload multiple images at once
8. **Drag & Drop** - Drag to upload interface
9. **Edit Projects** - Modify existing projects with image updates
10. **Image Versioning** - Keep upload history

## Testing Checklist

- [ ] Upload JPEG image - Success
- [ ] Upload PNG image - Success
- [ ] Upload GIF image - Success
- [ ] Upload WebP image - Success
- [ ] Try uploading PDF - Rejected with error
- [ ] Try uploading 10MB file - Rejected with size error
- [ ] Upload main image and create project - Project appears in list
- [ ] Upload multiple additional images - All display in project
- [ ] Verify images accessible at URL - Direct browser access works
- [ ] Delete project - Images and project removed
- [ ] View project in table - Correct image displays
- [ ] Auto-slug generation - Slug updates from title
- [ ] Category/Technology selection - Saves correctly
- [ ] SEO field validation - Displays in form

## Related Files

- Upload API: `/app/api/upload/route.ts`
- Content Page: `/app/admin/content.tsx`
- Project API: `/app/api/projects/route.ts`
- Database Schema: `/prisma/schema.prisma`
- Prisma Client: `/lib/prisma.ts`
- Design Tokens: `/lib/design/tokens.ts`

---

**Last Updated:** 2024
**Status:** Complete and Ready for Testing
**Next Phase:** Browser testing and production deployment
