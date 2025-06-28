# Green Apple School Course Application Backend

This is a Node.js/Express backend for the Green Apple Alternative High School course application system. It provides a complete solution for managing student course applications with a SQLite database.

## Features

- **Course Application Submission**: Students can submit course applications with all required information
- **Admin Dashboard**: School administrators can view, search, and manage applications
- **Application Status Management**: Approve, reject, or waitlist applications
- **Database Storage**: All applications are stored in a SQLite database
- **RESTful API**: Clean API endpoints for frontend integration
- **Form Validation**: Server-side validation for all form fields
- **Course Management**: Pre-populated course database with Ontario curriculum codes

## Database Schema

### Applications Table
- `id` - Primary key
- `first_name`, `last_name` - Student name
- `date_of_birth` - Student date of birth
- `gender` - Student gender
- `email`, `phone` - Contact information
- `address`, `city`, `postal_code` - Address information
- `current_grade_level` - Current grade (9-12)
- `current_school` - Current school name
- `preferred_pathway` - University, College, Apprenticeship, Workplace, or Undecided
- `previous_courses` - Previous relevant courses
- `selected_courses` - JSON array of selected course codes
- `preferred_semester` - Fall, Winter, or Summer
- `has_iep` - Whether student has an Individual Education Plan
- `accommodations` - Required accommodations
- `academic_goals` - Academic/career goals
- `application_date` - Timestamp of application submission
- `status` - Application status (pending, approved, rejected, waitlisted)

### Courses Table
- `id` - Primary key
- `course_code` - Ontario curriculum course code (e.g., ENG1D)
- `course_name` - Full course name
- `grade_level` - Grade level (9-12)
- `description` - Course description

## API Endpoints

### Application Management
- `POST /api/submit-application` - Submit a new course application
- `GET /api/applications` - Get all applications (admin)
- `GET /api/applications/:id` - Get specific application details
- `PUT /api/applications/:id/status` - Update application status

### Course Management
- `GET /api/courses` - Get all available courses

### Web Pages
- `GET /` - Course application form
- `GET /admin` - Admin dashboard

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd SCHOOL/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Application Form: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - API Base URL: http://localhost:3000/api

## Usage

### For Students
1. Visit http://localhost:3000
2. Fill out the complete application form
3. Select courses (maximum 4 per semester)
4. Submit the application
5. Receive confirmation with application ID

### For Administrators
1. Visit http://localhost:3000/admin
2. View all submitted applications
3. Search applications by name, email, or ID
4. Click "View" to see detailed application information
5. Update application status (Approve/Reject/Waitlist)

## Form Fields Explained

### Personal Information
- **First Name, Last Name**: Student's full name
- **Date of Birth**: Student's birth date
- **Gender**: Student's gender (optional)
- **Email, Phone**: Contact information
- **Address, City, Postal Code**: Complete address

### Academic Information
- **Current Grade Level**: Grade 9, 10, 11, or 12
- **Current School**: Name of current school (optional)
- **Preferred Pathway**: University, College, Apprenticeship, Workplace, or Undecided
- **Previous Relevant Courses**: Any relevant courses taken previously

### Course Selection
- **Selected Courses**: Choose from available courses by grade level
- **Preferred Semester**: Fall (September), Winter (February), or Summer (July)

### Additional Information
- **IEP**: Whether student has an Individual Education Plan
- **Accommodations**: Any required learning accommodations
- **Academic Goals**: Student's academic and career goals

## Validation Rules

- All required fields must be completed
- Maximum 4 courses can be selected per semester
- At least 1 course must be selected
- Email must be in valid format
- Phone number is required
- Date of birth is required

## Database File

The application uses SQLite with a file called `applications.db` that will be created automatically when you first run the server. This file contains:
- All submitted applications
- Course database
- Application status tracking

## Security Considerations

For production deployment, consider:
- Adding authentication for admin access
- Implementing HTTPS
- Adding input sanitization
- Setting up proper email notifications
- Adding rate limiting
- Implementing CSRF protection

## Customization

### Adding New Courses
Edit the `insertSampleCourses()` function in `server.js` to add more courses:

```javascript
const courses = [
    // Add new courses here
    { code: 'NEW1D', name: 'New Course', grade: 9, description: 'Course description' }
];
```

### Modifying Form Fields
1. Update the HTML form in `../apply.html`
2. Update the database schema in `server.js`
3. Update the API endpoint validation
4. Update the admin dashboard display

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT variable in `server.js`
2. **Database errors**: Delete `applications.db` and restart the server
3. **Form not submitting**: Check browser console for JavaScript errors
4. **Admin dashboard not loading**: Ensure the server is running and accessible

### Error Messages
- "Please fill in all required fields" - Missing required form data
- "Please select at least one course" - No courses selected
- "You can select a maximum of 4 courses per semester" - Too many courses selected

## Support

For technical support or questions about the application system, contact the development team.

---

**Green Apple Alternative High School**  
123 Education Avenue, Brampton, ON L6Y 1Z1  
Phone: (905) 123-4567 | Email: admissions@greenappleschool.edu 