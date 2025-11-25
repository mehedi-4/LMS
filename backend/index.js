const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const pool = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'data')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVideo = /\[video\]$/.test(file.fieldname);
    const uploadDir = path.join(__dirname, 'data', isVideo ? 'videos' : 'materials');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || ''));
  },
});

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB limit

const ensureCourseManifest = async (coursePayload) => {
  const coursesDir = path.join(__dirname, 'data', 'courses');
  const manifestPath = path.join(coursesDir, 'index.json');
  const courseFilePath = path.join(coursesDir, `${coursePayload.courseId}.json`);

  await fsp.mkdir(coursesDir, { recursive: true });
  await fsp.writeFile(courseFilePath, JSON.stringify(coursePayload, null, 2));

  let manifest = [];
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(await fsp.readFile(manifestPath, 'utf-8'));
    } catch (err) {
      console.warn('Failed to parse courses manifest. Reinitializing.', err.message);
    }
  }

  const existingIndex = manifest.findIndex((entry) => entry.courseId === coursePayload.courseId);
  if (existingIndex > -1) {
    manifest[existingIndex] = coursePayload;
  } else {
    manifest.push(coursePayload);
  }

  await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
};

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    // Get connection from pool
    const connection = await pool.getConnection();

    // Query the instructor table
    const [rows] = await connection.execute(
      'SELECT * FROM instructor WHERE username = ?',
      [username]
    );

    connection.release();

    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const instructor = rows[0];

    // Compare password (simple string comparison, no hashing)
    if (instructor.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Login successful
    res.json({
      success: true,
      message: 'Login successful',
      instructor: {
        id: instructor.tid,
        username: instructor.username,
        isSet: instructor.payment_setup,
        acc_no : instructor.bank_acc_no,
        secret_key : instructor.bank_secret_key,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

app.post('/api/student/login', async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    connection = await pool.getConnection();

    const [rows] = await connection.execute('SELECT * FROM student WHERE username = ?', [username]);

    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const student = rows[0];

    res.json({
      success: true,
      message: 'Login successful',
      student: {
        id: student.uid,
        username: student.username,
        paymentSetup: student.payment_setup,
        bankAccNo: student.bank_acc_no,
        bankSecretKey: student.bank_secret_key,
      },
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post('/api/student/signup', async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    connection = await pool.getConnection();

    const [existing] = await connection.execute('SELECT uid FROM student WHERE username = ?', [username]);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken',
      });
    }

    const [result] = await connection.execute(
      'INSERT INTO student (username, password, payment_setup) VALUES (?, ?, 0)',
      [username, password]
    );

    res.json({
      success: true,
      message: 'Account created successfully',
      student: {
        id: result.insertId,
        username,
        paymentSetup: 0,
        bankAccNo: null,
        bankSecretKey: null,
      },
    });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post('/api/student/payment-setup', async (req, res) => {
  let connection;
  try {
    const { username, bankAccNo, bankSecretKey } = req.body;

    if (!username || !bankAccNo || !bankSecretKey) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    connection = await pool.getConnection();

    await connection.execute(
      'UPDATE student SET bank_acc_no = ?, bank_secret_key = ?, payment_setup = 1 WHERE username = ?',
      [bankAccNo, bankSecretKey, username]
    );

    const [rows] = await connection.execute('SELECT * FROM student WHERE username = ?', [username]);
    const student = rows[0];

    res.json({
      success: true,
      message: 'Payment setup saved successfully',
      student: {
        // id: student.uid,
        username: student.username,
        paymentSetup: student.payment_setup,
        bankAccNo: student.bank_acc_no,
        bankSecretKey: student.bank_secret_key,
      },
    });
  } catch (error) {
    console.error('Student payment setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Payment Setup endpoint
app.post('/api/instructor/payment-setup', async (req, res) => {
  try {
    const { instructorId, bankAccNo, bankSecretKey } = req.body;

    if (!instructorId || !bankAccNo || !bankSecretKey) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE instructor SET payment_setup = 1, bank_acc_no = ?, bank_secret_key = ? WHERE tid = ?',
      [bankAccNo, bankSecretKey, instructorId]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Payment setup saved successfully',
    });
  } catch (error) {
    console.error('Payment setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Upload Course endpoint
// Upload Course endpoint
app.post('/api/courses/upload', upload.any(), async (req, res) => {
  let connection;
  try {
    // Debug: Log what we're receiving
    console.log('=== UPLOAD DEBUG ===');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Body:', req.body);
    console.log('Files:', req.files?.map(f => ({ fieldname: f.fieldname, originalname: f.originalname })));
    console.log('====================');

    const { instructorId, title, description, numberOfLectures, price } = req.body;

    if (!instructorId || !title || !description || !numberOfLectures || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required course information',
      });
    }

    const instructorIdNum = Number(instructorId);
    if (Number.isNaN(instructorIdNum) || instructorIdNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Instructor ID must be a positive number',
      });
    }

    const lectureCount = parseInt(numberOfLectures, 10);
    if (Number.isNaN(lectureCount) || lectureCount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Number of lectures must be a positive integer',
      });
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number',
      });
    }

    const files = req.files || [];

    connection = await pool.getConnection();

    // Create course
    const [courseResult] = await connection.execute(
      'INSERT INTO course (course_name, description, price, instructor_id) VALUES (?, ?, ?, ?)',
      [title, description, parsedPrice, instructorIdNum]
    );

    const courseId = courseResult.insertId;

    // Parse lecture data from body - handle multiple possible formats
    const getLectureTitle = (index) => {
      // Try different possible key formats
      const possibleKeys = [
        `lectures[${index}][title]`,
        `lectures.${index}.title`,
        `lectures[${index}]title`,
      ];
      
      for (const key of possibleKeys) {
        if (req.body[key] !== undefined) {
          return req.body[key];
        }
      }
      
      // Also check if body has nested structure (some parsers do this)
      if (req.body.lectures && Array.isArray(req.body.lectures) && req.body.lectures[index]) {
        return req.body.lectures[index].title;
      }
      
      return null;
    };

    // Organize files by lecture index
    const lectureFiles = {};
    files.forEach((file) => {
      // Match patterns like: lectures[0][video] or lectures[0][materials]
      const match = file.fieldname.match(/^lectures\[(\d+)\]\[(video|materials)\]/);
      if (!match) {
        console.log('Unmatched file fieldname:', file.fieldname);
        return;
      }
      const lectureIndex = Number(match[1]);
      if (Number.isNaN(lectureIndex)) {
        return;
      }
      if (!lectureFiles[lectureIndex]) {
        lectureFiles[lectureIndex] = { video: null, materials: [] };
      }
      if (match[2] === 'video' && !lectureFiles[lectureIndex].video) {
        lectureFiles[lectureIndex].video = file;
      } else if (match[2] === 'materials') {
        lectureFiles[lectureIndex].materials.push(file);
      }
    });

    console.log('Parsed lectureFiles:', Object.keys(lectureFiles));

    const lecturesPayload = [];

    for (let i = 0; i < lectureCount; i++) {
      const lectureTitle = getLectureTitle(i);
      const videoFile = lectureFiles[i]?.video;
      const materialFiles = lectureFiles[i]?.materials ?? [];

      console.log(`Lecture ${i}: title="${lectureTitle}", hasVideo=${!!videoFile}`);

      if (!lectureTitle) {
        throw new Error(`Lecture ${i + 1} is missing a title. Received keys: ${Object.keys(req.body).filter(k => k.includes(String(i))).join(', ')}`);
      }
      
      if (!videoFile) {
        throw new Error(`Lecture ${i + 1} is missing a video. Available files for this lecture: ${lectureFiles[i] ? 'found entry but no video' : 'no entry found'}`);
      }

      const videoPath = `/uploads/videos/${videoFile.filename}`;

      const [lectureResult] = await connection.execute(
        'INSERT INTO course_lecture (course_id, lecture_number, title, video_path, video_original_name, video_mime, video_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [courseId, i + 1, lectureTitle, videoPath, videoFile.originalname, videoFile.mimetype, videoFile.size]
      );

      const lectureId = lectureResult.insertId;

      const materialsPayload = [];
      for (const file of materialFiles) {
        const materialPath = `/uploads/materials/${file.filename}`;
        await connection.execute(
          'INSERT INTO course_material (lecture_id, material_type, file_path, file_name, created_at) VALUES (?, ?, ?, ?, NOW())',
          [lectureId, file.mimetype, materialPath, file.originalname]
        );
        materialsPayload.push({
          originalName: file.originalname,
          mimeType: file.mimetype,
          storagePath: materialPath,
          filename: file.filename,
        });
      }

      lecturesPayload.push({
        lectureNumber: i + 1,
        title: lectureTitle,
        video: {
          originalName: videoFile.originalname,
          mimeType: videoFile.mimetype,
          storagePath: videoPath,
          filename: videoFile.filename,
          size: videoFile.size,
        },
        materials: materialsPayload,
      });
    }

    const coursePayload = {
      courseId,
      instructorId: instructorIdNum,
      title,
      description,
      price: parsedPrice,
      numberOfLectures: lectureCount,
      lectures: lecturesPayload,
      createdAt: new Date().toISOString(),
    };

    await ensureCourseManifest(coursePayload);

    res.json({
      success: true,
      message: 'Course uploaded successfully',
      courseId: courseId,
    });
  } catch (error) {
    console.error('Course upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get Instructor's Courses endpoint
app.get('/api/courses/instructor/:instructorId', async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: 'Instructor ID is required',
      });
    }

    const connection = await pool.getConnection();

    // Get all courses for this instructor
    const [courses] = await connection.execute(
      'SELECT cid AS id, course_name AS title, description, price FROM course WHERE instructor_id = ? ORDER BY cid DESC',
      [instructorId]
    );

    // For each course, get its lectures
    for (let course of courses) {
      const [lectures] = await connection.execute(
        'SELECT * FROM course_lecture WHERE course_id = ? ORDER BY lecture_number ASC',
        [course.id]
      );

      // For each lecture, get its materials
      for (let lecture of lectures) {
        const [materials] = await connection.execute(
          'SELECT * FROM course_material WHERE lecture_id = ? ORDER BY created_at ASC',
          [lecture.id]
        );
        lecture.materials = materials;
      }

      course.lectures = lectures;
    }

    connection.release();

    res.json({
      success: true,
      courses: courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
