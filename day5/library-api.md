
# Library Books REST API Design

## Overview

The Library Books API allows users to list books, view individual books, create new books, update existing books, delete books, and filter books by author.

Base URL: `/api/books`

Data format: JSON

## Book Resource

Each book has the following fields:

- `id`: Unique book identifier.
- `title`: Book title.
- `author`: Author's name.
- `publishedYear`: Year the book was published.
- `available`: Whether the book is available.

## API Endpoints

### 1. List all books

- Method: `GET`
- Path: `/api/books`
- Description: Returns all books.
- Example response body:

```json
[
  {
    "id": 1,
    "title": "Introduction to Programming",
    "author": "Jane Doe",
    "publishedYear": 2024,
    "available": true
  }
]
```

- Success status: `200 OK`

### 2. Get one book

- Method: `GET`
- Path: `/api/books/:id`
- Description: Returns one book by its ID.
- Example response body:

```json
{
  "id": 1,
  "title": "Introduction to Programming",
  "author": "Jane Doe",
  "publishedYear": 2024,
  "available": true
}
```

- Success status: `200 OK`
- Error status: `404 Not Found` if the book does not exist.

### 3. Create a book

- Method: `POST`
- Path: `/api/books`
- Description: Creates a new book.
- Example request body:

```json
{
  "title": "Web Development Basics",
  "author": "John Smith",
  "publishedYear": 2025,
  "available": true
}
```

- Success status: `201 Created`
- Error status: `400 Bad Request` if required fields are missing or invalid.

### 4. Update a book

- Method: `PUT`
- Path: `/api/books/:id`
- Description: Replaces the details of an existing book.
- Example request body:

```json
{
  "title": "Advanced Web Development",
  "author": "John Smith",
  "publishedYear": 2026,
  "available": false
}
```

- Success status: `200 OK`
- Error status: `404 Not Found` if the book does not exist.

### 5. Delete a book

- Method: `DELETE`
- Path: `/api/books/:id`
- Description: Deletes a book by its ID.
- Example request body: None required.
- Success status: `204 No Content`
- Error status: `404 Not Found` if the book does not exist.

### 6. List books by author

- Method: `GET`
- Path: `/api/books?author=Jane%20Doe`
- Description: Returns books written by the specified author.
- Example response body:

```json
[
  {
    "id": 1,
    "title": "Introduction to Programming",
    "author": "Jane Doe",
    "publishedYear": 2024,
    "available": true
  }
]
```

- Success status: `200 OK`
- If no books match, return `200 OK` with an empty array.

## Error Responses

### 400 Bad Request

This occurs when the client submits invalid data, such as creating a book without a title.

Example:

```json
{
  "error": "Bad Request",
  "message": "The title field is required."
}
```

### 404 Not Found

This occurs when the requested book ID does not exist.

Example:

```json
{
  "error": "Not Found",
  "message": "Book not found."
}
```

## Summary

The API uses standard HTTP methods and status codes. It supports CRUD operations (Create, Read, Update and Delete), author filtering, JSON request and response bodies, and clear error messages.
