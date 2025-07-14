# Standard RedwoodSDK Starter

This "standard starter" is a recommended implementation for RedwoodSDK. You get a Typescript project with:

- Vite
- database (Prisma via D1)
- Session Management (via DurableObjects)
- Passkey authentication (Webauthn)
- Storage (via R2)

## About This Application

This is a **Learning Management System (LMS)** built with RedwoodSDK that allows you to create and manage online courses. The application features:

### Core Features
- **Course Management**: Create, edit, and organize courses with modules and lessons
- **User Management**: Support for students, instructors, and administrators
- **Progress Tracking**: Monitor student progress through courses and lessons
- **Video Content**: Support for both uploaded videos and YouTube videos
- **Admin Dashboard**: Comprehensive admin interface for managing content and users

### User Roles
- **Students**: Can browse and take courses, track their progress
- **Instructors/Creators**: Can create and manage their own courses
- **Administrators**: Full access to manage all courses, users, and system settings

## Work in Progress

This application is actively being developed and some features are still missing:

### Missing Features
- **Password Management**: Users cannot currently update their passwords
- **Email Verification**: No email verification system for new registrations
- **Password Reset**: No forgot password functionality
- **User Profile Management**: Limited profile editing capabilities
- **Course Search & Filtering**: No search functionality for courses
- **Course Categories/Tags**: No categorization system for courses
- **Discussion/Comments**: No commenting system on lessons
- **Certificate Generation**: No completion certificates
- **Payment Integration**: No payment processing for premium courses

### Contributing
This is an open-source project and contributions are welcome! Feel free to submit issues or pull requests for missing features or improvements.

## Getting Started

Clone this repository and install dependencies:

```shell
git clone <repository-url>
cd learn-sdk
pnpm install
```

## Running the dev server

```shell
pnpm dev
```

Point your browser to the URL displayed in the terminal (e.g. `http://localhost:5173/`). You should see the course listing page in your browser.

## Default Admin Access

After running the seed script, you'll have access to the admin panel with these default credentials:

- **Email**: `admin@example.com`
- **Username**: `admin`
- **Password**: `admin`

### Accessing the Admin Panel

1. Navigate to `/admin` in your browser
2. Log in with the credentials above
3. You'll have access to:
   - Course management (create, edit, delete courses)
   - Instructor management (add/edit instructor profiles)
   - Student progress tracking
   - System statistics

## Database Seeding

To populate your database with initial data, run:

```shell
pnpm seed
```

This will:
- Create the default admin user (see credentials above)
- Set up the database schema
- Clear any existing data

## Deploying your app

### Wrangler Setup

Within your project's `wrangler.jsonc`:

- Replace the `__change_me__` placeholders with a name for your application

- Create a new D1 database:

```shell
npx wrangler d1 create my-project-db
```

Copy the database ID provided and paste it into your project's `wrangler.jsonc` file:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-project-db",
      "database_id": "your-database-id",
    },
  ],
}
```

### Authentication Setup

For authentication setup and configuration, including optional bot protection, see the [Authentication Documentation](https://docs.rwsdk.com/core/authentication).

## Application Structure

### Key Pages
- **Home** (`/`): Course listing and overview
- **Course Details** (`/courses/[id]`): Individual course information and curriculum
- **Lesson Content** (`/courses/[id]/lessons`): Interactive lesson viewer
- **Admin Dashboard** (`/admin`): Course and user management
- **User Authentication** (`/user/login`, `/user/register`): User account management

### Database Schema
The application uses a comprehensive schema with:
- **Users**: Students, instructors, and administrators
- **Courses**: Main course content with metadata
- **Modules**: Course sections that group related lessons
- **Lessons**: Individual learning units with video content
- **Progress**: Student progress tracking through lessons
- **LessonContent**: Video and text content for lessons

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/runtime-apis/secrets/)
