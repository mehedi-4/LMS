const pool = require('./db');

async function setupDatabase() {
  try {
    const connection = await pool.getConnection();

    console.log('Setting up database tables...\n');

    // Create course table (matches existing schema if already present)
    console.log('Ensuring course table exists...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course (
        cid BIGINT AUTO_INCREMENT PRIMARY KEY,
        course_name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) DEFAULT 0.00,
        instructor_id BIGINT NOT NULL,
        FOREIGN KEY (instructor_id) REFERENCES instructor(tid)
      )
    `);

    // Create course_lecture table
    console.log('Creating course_lecture table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_lecture (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        course_id BIGINT NOT NULL,
        lecture_number INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        video_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES course(cid) ON DELETE CASCADE,
        UNIQUE KEY uq_course_lecture (course_id, lecture_number)
      )
    `);

    // Create course_material table
    console.log('Creating course_material table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_material (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        lecture_id BIGINT NOT NULL,
        material_type VARCHAR(100),
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lecture_id) REFERENCES course_lecture(id) ON DELETE CASCADE
      )
    `);

    // Optional: course_manifest table for JSON payloads
    console.log('Creating course_manifest table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_manifest (
        course_id BIGINT PRIMARY KEY,
        payload JSON NOT NULL,
        stored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES course(cid) ON DELETE CASCADE
      )
    `);

    // Add bank columns to instructor table if they don't exist
    console.log('Updating instructor table...');
    await connection.execute(`
      ALTER TABLE instructor 
      ADD COLUMN IF NOT EXISTS bank_acc_no VARCHAR(50),
      ADD COLUMN IF NOT EXISTS bank_secret_key VARCHAR(255)
    `);

    connection.release();

    console.log('\n✓ Database setup completed successfully!');
    console.log('\nTables created:');
    console.log('- course');
    console.log('- course_lecture');
    console.log('- course_material');
    console.log('- course_manifest');
    console.log('\nInstructor table updated with:');
    console.log('- bank_acc_no column');
    console.log('- bank_secret_key column');

    process.exit(0);
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
}

setupDatabase();
