
# School Database Design

## 1. Students Table

The `students` table stores information about each student. It contains an integer `id` as its primary key, a required `name`, and a required `email`. The email is unique so that two students cannot register with the same email address.

## 2. Courses Table

The `courses` table stores the courses offered by the school. It contains an integer `id` as its primary key and a required, unique `course_name`.

## 3. Enrolments Table

The `enrolments` table records which students take which courses and the grade they receive. It contains its own primary key, `id`, along with `student_id` and `course_id` foreign keys that reference the students and courses tables. The `grade` field stores the student's grade for that course.

The combination of `student_id` and `course_id` is unique. This prevents a student from enrolling in the same course more than once.

## Relationships

### One-to-Many Relationships

- Students to enrolments: one student can have many enrolment records, but each enrolment belongs to one student.
- Courses to enrolments: one course can have many enrolment records, but each enrolment belongs to one course.

### Many-to-Many Relationship

Students and courses have a many-to-many relationship. One student can take several courses, and one course can have several students.

The `enrolments` table is the join table that connects students to courses. It is needed because a direct many-to-many relationship cannot be represented cleanly using a single foreign key in either table. It also stores the grade associated with each student-course combination.

## Index Recommendation

I would add an index on `enrolments(course_id)` to speed up queries that find all students enrolled in a particular course and queries that count enrolments by course. The unique constraint on `(student_id, course_id)` also provides an index useful for looking up a student's enrolment in a particular course.

Example:

```sql
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);
```

## SQL or NoSQL?

I would choose a relational SQL database such as SQLite for this school system. Students, courses, and enrolments have clear relationships, and the enrolments table must reliably connect existing students and courses. Primary keys, foreign keys, unique constraints, and transactions help preserve data integrity. SQL also makes it straightforward to retrieve course lists, join student records, calculate enrolment totals, and update grades. A NoSQL database could be useful for flexible or unstructured data, but a relational database is a natural fit for this structured system.
```

Save it.

## Step 4 — Test the SQL

1. Open [SQLite Online](https://sqliteonline.com/).
2. Choose SQLite if it isn't already selected.
3. Copy the entire contents of `school.sql` into the SQL editor.
4. Click **Run**.

Check that the statements execute without errors. Depending on the playground, you may need to select and run individual queries to see each result.

Expected results:

| Query | Expected result |
|---|---|
| 1. Alice's courses | 2 courses |
| 2. Web Development students | Alice and Brian |
| 3. Student count per course | 3 students in total across courses, with zero for Computer Networks |
| 4. Students without enrolments | David Kamau |
| 5. Update grade | Brian's Web Development grade becomes A |

The index recommendation in `school-design.md` is documentation only; it does not need to be added to `school.sql` to satisfy the five required queries.

## Step 5 — Commit and push to GitHub

Return to the VS Code terminal. Run these commands one at a time:

<CodeBlock language="powershell" editable>
cd C:\Users\Denno\Desktop\web-foundations-days

git add day6/school.sql day6/school-design.md

git commit -m "Day 6 assignment"

git push
