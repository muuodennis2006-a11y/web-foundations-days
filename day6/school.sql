
PRAGMA foreign_keys = ON;

-- 1. Create the students table
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Create the courses table
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE
);

-- 3. Create the enrolments join table
CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (student_id, course_id)
);

-- Insert sample students (at least 3)
INSERT INTO students (id, name, email) VALUES
(1, 'Alice Brown', 'alice@example.com'),
(2, 'Brian Otieno', 'brian@example.com'),
(3, 'Carol Mwangi', 'carol@example.com'),
(4, 'David Kamau', 'david@example.com');

-- Insert sample courses (at least 3)
INSERT INTO courses (id, course_name) VALUES
(1, 'Web Development'),
(2, 'Database Systems'),
(3, 'Statistics'),
(4, 'Computer Networks');

-- Insert sample enrolments (at least 5)
INSERT INTO enrolments (id, student_id, course_id, grade) VALUES
(1, 1, 1, 'A'),
(2, 1, 2, 'B'),
(3, 2, 1, 'B'),
(4, 2, 3, 'A'),
(5, 3, 2, 'A'),
(6, 3, 3, 'B');

-- QUERY 1: All courses taken by one student (Alice Brown)
SELECT s.name AS student_name, c.course_name
FROM students AS s
JOIN enrolments AS e ON s.id = e.student_id
JOIN courses AS c ON c.id = e.course_id
WHERE s.name = 'Alice Brown';

-- QUERY 2: All students enrolled in one course (Web Development)
SELECT c.course_name, s.name AS student_name
FROM courses AS c
JOIN enrolments AS e ON c.id = e.course_id
JOIN students AS s ON s.id = e.student_id
WHERE c.course_name = 'Web Development';

-- QUERY 3: Number of students per course, including courses with zero students
SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON c.id = e.course_id
GROUP BY c.id, c.course_name
ORDER BY c.id;

-- QUERY 4: Students who have no enrolments
SELECT s.id, s.name, s.email
FROM students AS s
LEFT JOIN enrolments AS e ON s.id = e.student_id
WHERE e.id IS NULL;

-- QUERY 5: Update one enrolment's grade
UPDATE enrolments
SET grade = 'A'
WHERE student_id = 2 AND course_id = 1;

-- Display the updated grade to verify the update
SELECT s.name AS student_name, c.course_name, e.grade
FROM enrolments AS e
JOIN students AS s ON s.id = e.student_id
JOIN courses AS c ON c.id = e.course_id
WHERE e.student_id = 2 AND e.course_id = 1;
