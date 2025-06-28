const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5500', 
        'http://127.0.0.1:5500', 
        'http://127.0.0.1:3000',
        'https://*.netlify.app',
        'https://*.herokuapp.com',
        'https://*.vercel.app',
        'https://*.firebaseapp.com'
    ],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../')));

// Database connection
const db = new sqlite3.Database('./applications.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Initialize database tables
const initDatabase = () => {
    const createApplicationsTable = `
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            gender TEXT,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            postal_code TEXT NOT NULL,
            current_grade_level INTEGER NOT NULL,
            current_school TEXT,
            preferred_pathway TEXT NOT NULL,
            previous_courses TEXT,
            selected_courses TEXT NOT NULL,
            preferred_semester TEXT NOT NULL,
            has_iep TEXT NOT NULL,
            accommodations TEXT,
            academic_goals TEXT,
            application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending'
        )
    `;

    const createCoursesTable = `
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_code TEXT UNIQUE NOT NULL,
            course_name TEXT NOT NULL,
            grade_level INTEGER NOT NULL,
            description TEXT
        )
    `;

    const createContactsTable = `
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            program TEXT,
            message TEXT NOT NULL,
            submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'new'
        )
    `;

    db.run(createApplicationsTable, (err) => {
        if (err) {
            console.error('Error creating applications table:', err.message);
        } else {
            console.log('Applications table ready');
        }
    });

    db.run(createCoursesTable, (err) => {
        if (err) {
            console.error('Error creating courses table:', err.message);
        } else {
            console.log('Courses table ready');
            // Insert sample courses if table is empty
            insertSampleCourses();
        }
    });

    db.run(createContactsTable, (err) => {
        if (err) {
            console.error('Error creating contacts table:', err.message);
        } else {
            console.log('Contacts table ready');
        }
    });
};

// Insert sample courses
const insertSampleCourses = () => {
    const courses = [
        { code: 'ENG1D', name: 'English (Academic)', grade: 9, description: 'Academic English for Grade 9' },
        { code: 'MPM1D', name: 'Principles of Mathematics', grade: 9, description: 'Academic Mathematics for Grade 9' },
        { code: 'ENG2D', name: 'English (Academic)', grade: 10, description: 'Academic English for Grade 10' },
        { code: 'MCR3U', name: 'Functions', grade: 10, description: 'University Mathematics for Grade 10' },
        { code: 'ENG3U', name: 'English (University)', grade: 11, description: 'University English for Grade 11' },
        { code: 'SBI3U', name: 'Biology (University)', grade: 11, description: 'University Biology for Grade 11' },
        { code: 'ENG4U', name: 'English (University)', grade: 12, description: 'University English for Grade 12' },
        { code: 'MHF4U', name: 'Advanced Functions', grade: 12, description: 'University Advanced Functions for Grade 12' }
    ];

    const insertCourse = db.prepare('INSERT OR IGNORE INTO courses (course_code, course_name, grade_level, description) VALUES (?, ?, ?, ?)');
    
    courses.forEach(course => {
        insertCourse.run(course.code, course.name, course.grade, course.description);
    });
    
    insertCourse.finalize();
};

// Routes

// Serve the application form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../apply.html'));
});

// Serve the home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../SCHOOL.HTML'));
});

// Serve the admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve the contact admin dashboard
app.get('/contact-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact-admin.html'));
});

// Serve the contact thank you page
app.get('/contact-thank-you', (req, res) => {
    res.sendFile(path.join(__dirname, '../contact-thank-you.html'));
});

// Serve static files (CSS, JS, etc.)
app.use('/static', express.static(path.join(__dirname, '../')));

// Submit application
app.post('/api/submit-application', (req, res) => {
    const {
        'first-name': firstName,
        'last-name': lastName,
        'dob': dateOfBirth,
        'gender': gender,
        'email': email,
        'phone': phone,
        'address': address,
        'city': city,
        'postal': postalCode,
        'grade-level': currentGradeLevel,
        'current-school': currentSchool,
        'pathway': preferredPathway,
        'previous-courses': previousCourses,
        'courses': selectedCourses,
        'semester': preferredSemester,
        'iep': hasIep,
        'accommodations': accommodations,
        'goals': academicGoals
    } = req.body;

    // Validation
    if (!firstName || !lastName || !dateOfBirth || !email || !phone || !address || 
        !city || !postalCode || !currentGradeLevel || !preferredPathway || 
        !selectedCourses || !preferredSemester || !hasIep) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all required fields'
        });
    }

    // Validate course selection (max 4 courses)
    if (!Array.isArray(selectedCourses) || selectedCourses.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please select at least one course'
        });
    }

    if (selectedCourses.length > 4) {
        return res.status(400).json({
            success: false,
            message: 'You can select a maximum of 4 courses per semester'
        });
    }

    const coursesString = JSON.stringify(selectedCourses);

    const sql = `
        INSERT INTO applications (
            first_name, last_name, date_of_birth, gender, email, phone, 
            address, city, postal_code, current_grade_level, current_school,
            preferred_pathway, previous_courses, selected_courses, 
            preferred_semester, has_iep, accommodations, academic_goals
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        firstName, lastName, dateOfBirth, gender, email, phone,
        address, city, postalCode, currentGradeLevel, currentSchool,
        preferredPathway, previousCourses, coursesString,
        preferredSemester, hasIep, accommodations, academicGoals
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error inserting application:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error saving application. Please try again.'
            });
        }

        // Send confirmation email (optional)
        sendConfirmationEmail(email, firstName, lastName, this.lastID);

        res.json({
            success: true,
            message: 'Application submitted successfully!',
            applicationId: this.lastID
        });
    });
});

// Get all applications (admin endpoint)
app.get('/api/applications', (req, res) => {
    const sql = 'SELECT * FROM applications ORDER BY application_date DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching applications:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error fetching applications'
            });
        }

        // Parse selected courses back to array
        const applications = rows.map(row => ({
            ...row,
            selected_courses: JSON.parse(row.selected_courses)
        }));

        res.json({
            success: true,
            applications: applications
        });
    });
});

// Get application by ID
app.get('/api/applications/:id', (req, res) => {
    const sql = 'SELECT * FROM applications WHERE id = ?';
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            console.error('Error fetching application:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error fetching application'
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Parse selected courses back to array
        row.selected_courses = JSON.parse(row.selected_courses);

        res.json({
            success: true,
            application: row
        });
    });
});

// Update application status (admin endpoint)
app.put('/api/applications/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'waitlisted'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        });
    }

    const sql = 'UPDATE applications SET status = ? WHERE id = ?';
    
    db.run(sql, [status, req.params.id], function(err) {
        if (err) {
            console.error('Error updating application status:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error updating application status'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Application status updated successfully'
        });
    });
});

// Get available courses
app.get('/api/courses', (req, res) => {
    const sql = 'SELECT * FROM courses ORDER BY grade_level, course_code';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching courses:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error fetching courses'
            });
        }

        res.json({
            success: true,
            courses: rows
        });
    });
});

// Test connection endpoint
app.get('/api/test-connection', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running and ready to accept submissions'
    });
});

// Admin authentication endpoint
app.post('/api/admin-login', (req, res) => {
    const { password } = req.body;
    
    // You can change this password to whatever you want
    const ADMIN_PASSWORD = 'admin123';
    
    if (password === ADMIN_PASSWORD) {
        res.json({
            success: true,
            message: 'Authentication successful'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
});

// Submit contact form
app.post('/api/submit-contact', (req, res) => {
    const {
        fullname,
        email,
        phone,
        program,
        message
    } = req.body;

    // Validation
    if (!fullname || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all required fields (name, email, and message)'
        });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid email address'
        });
    }

    const sql = `
        INSERT INTO contacts (fullname, email, phone, program, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    const params = [fullname, email, phone || '', program || '', message];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error inserting contact:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error saving your message. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.',
            contactId: this.lastID
        });
    });
});

// Get all contacts (admin endpoint)
app.get('/api/contacts', (req, res) => {
    const sql = 'SELECT * FROM contacts ORDER BY submission_date DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching contacts:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error fetching contacts'
            });
        }

        res.json({
            success: true,
            contacts: rows
        });
    });
});

// Get contact by ID
app.get('/api/contacts/:id', (req, res) => {
    const sql = 'SELECT * FROM contacts WHERE id = ?';
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            console.error('Error fetching contact:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error fetching contact'
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            contact: row
        });
    });
});

// Update contact status (admin endpoint)
app.put('/api/contacts/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'archived'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        });
    }

    const sql = 'UPDATE contacts SET status = ? WHERE id = ?';
    
    db.run(sql, [status, req.params.id], function(err) {
        if (err) {
            console.error('Error updating contact status:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error updating contact status'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated successfully'
        });
    });
});

// Delete contact (admin endpoint)
app.delete('/api/contacts/:id', (req, res) => {
    const sql = 'DELETE FROM contacts WHERE id = ?';
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            console.error('Error deleting contact:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error deleting contact'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    });
});

// Simple email confirmation function (you'll need to configure SMTP)
const sendConfirmationEmail = (email, firstName, lastName, applicationId) => {
    // This is a placeholder. In production, you'd use nodemailer with proper SMTP configuration
    console.log(`Confirmation email would be sent to ${email} for application ${applicationId}`);
    console.log(`Dear ${firstName} ${lastName}, your application has been received and is being reviewed.`);
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Initialize database and start server
initDatabase();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Application form available at: http://localhost:${PORT}`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api/`);
}); 