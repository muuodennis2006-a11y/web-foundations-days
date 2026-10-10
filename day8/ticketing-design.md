

\# Day 8 Assignment: TicketHub Event Ticketing System



\## 1. Requirements



\### Functional requirements

\- Users can browse, search, and view events.

\- Users can view seats and prices for each event.

\- Authenticated users can temporarily hold available seats.

\- Users can pay for orders and view their confirmed tickets.

\- Expired or cancelled holds release seats.

\- Administrators can create events and manage seat prices and sales.



\### Non-functional requirements

\- \*\*Speed:\*\* Event pages should normally load within 2 seconds.

\- \*\*Correctness:\*\* A seat must never be sold to two people.

\- \*\*Fairness:\*\* A waiting room, rate limits, and bot protection help users access popular sales fairly.

\- \*\*Availability:\*\* Browsing should continue where possible during partial failures; checkout must fail safely.

\- \*\*Security:\*\* Authenticate users, verify payment notifications, and protect personal information.

\- \*\*Scalability:\*\* Add app servers and workers as demand grows.

\- \*\*Recovery:\*\* Back up orders and make payment processing idempotent to prevent duplicate processing.



\## 2. Traffic and Capacity Estimates



Assume a day has 86,400 seconds. These are average estimates; actual traffic arrives in bursts.



\### Normal day

\- Registered users: 2,000,000.

\- Daily visitors: 50,000.

\- Pages per visitor: 10.

\- Page views per day = 50,000 × 10 = \*\*500,000\*\*.

\- Average page requests per second = 500,000 ÷ 86,400 = \*\*5.8 requests/second\*\*.

\- Tickets sold per day = \*\*5,000\*\*.

\- Average sales rate = 5,000 ÷ 86,400 = \*\*0.058 tickets/second\*\*.



\### Popular concert sale

\- Buyers attempting to purchase: 200,000 in 10 minutes.

\- Average buyer attempts per second = 200,000 ÷ 600 = \*\*333 attempts/second\*\*.

\- Seats available = 20,000.

\- At most \*\*20,000 seats\*\* can be sold.

\- Demand is 200,000 ÷ 20,000 = \*\*10 buyers per seat\*\*.

\- If every buyer makes 10 page/API requests during the sale, requests = 200,000 × 10 = 2,000,000.

\- Average request rate during those 10 minutes = 2,000,000 ÷ 600 = \*\*about 3,333 requests/second\*\*.



The big sale creates hundreds of buyer attempts per second and potentially thousands of API requests per second, compared with 5.8 average page views per second on a normal day. A waiting room, caching, rate limits, and horizontally scaled app servers help absorb the burst. Seat availability must still be checked by the database.



\## 3. API Design



Base path: `/api/v1`. Use JSON and authentication for account-specific operations.



| Method and path | Purpose | Success |

|---|---|---|

| `GET /events` | Browse and search events | 200 OK |

| `GET /events/{eventId}` | View event details | 200 OK |

| `GET /events/{eventId}/seats` | View seats and their displayed availability | 200 OK |

| `POST /holds` | Temporarily hold selected seats | 201 Created |

| `DELETE /holds/{holdId}` | Release a hold | 204 No Content |

| `POST /orders` | Create an order from a valid hold | 201 Created |

| `POST /orders/{orderId}/payment` | Start payment | 202 Accepted |

| `GET /me/tickets` | View the user's tickets | 200 OK |



Example hold request:



```json

{

&#x20; "eventId": 42,

&#x20; "seatIds": \[501, 502]

}

```



Example response:



```json

{

&#x20; "holdId": "hold\_abc123",

&#x20; "status": "HELD",

&#x20; "expiresAt": "2026-10-10T19:05:00Z"

}

```



A hold lasts for a limited period, such as five minutes. The server verifies that the seats belong to the event and are available.



Possible errors include `400 Bad Request` for invalid input, `401 Unauthorized` for missing authentication, `404 Not Found` for unknown resources, `409 Conflict` when a seat is unavailable, and `429 Too Many Requests` for rate limits.



\## 4. Data Model



\### Tables and relationships



\- \*\*users:\*\* `id` primary key, `name`, `email` unique, `password\_hash`, `created\_at`.

\- \*\*events:\*\* `id` primary key, `title`, `venue`, `starts\_at`, `sales\_open\_at`, `status`.

\- \*\*seats:\*\* `id` primary key, `event\_id` foreign key, `section`, `row\_label`, `seat\_number`, `price`, `status`.

\- \*\*orders:\*\* `id` primary key, `user\_id` foreign key, `status`, `total\_amount`, `payment\_reference` unique, `created\_at`.

\- \*\*order\_seats:\*\* `order\_id` and `seat\_id` foreign keys, `price\_at\_purchase`, composite primary key (`order\_id`, `seat\_id`).

\- \*\*seat\_holds:\*\* `id` primary key, `user\_id` and `seat\_id` foreign keys, `expires\_at`, `status`.



One user can have many orders (one-to-many). One event has many seats (one-to-many). Orders can contain multiple seats, and order history is represented through `order\_seats`. Users can create multiple holds. A production system must separately enforce that each seat has at most one active hold or confirmed allocation.



\### PostgreSQL-style SQL



```sql

CREATE TABLE users (

&#x20; id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

&#x20; name VARCHAR(120) NOT NULL,

&#x20; email VARCHAR(255) NOT NULL UNIQUE,

&#x20; password\_hash TEXT NOT NULL,

&#x20; created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);



CREATE TABLE events (

&#x20; id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

&#x20; title VARCHAR(200) NOT NULL,

&#x20; venue VARCHAR(200) NOT NULL,

&#x20; starts\_at TIMESTAMPTZ NOT NULL,

&#x20; sales\_open\_at TIMESTAMPTZ NOT NULL,

&#x20; status VARCHAR(20) NOT NULL

);



CREATE TABLE seats (

&#x20; id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

&#x20; event\_id BIGINT NOT NULL REFERENCES events(id),

&#x20; section VARCHAR(60) NOT NULL,

&#x20; row\_label VARCHAR(20) NOT NULL,

&#x20; seat\_number VARCHAR(20) NOT NULL,

&#x20; price NUMERIC(10,2) NOT NULL CHECK (price >= 0),

&#x20; status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'

&#x20;   CHECK (status IN ('AVAILABLE', 'HELD', 'SOLD')),

&#x20; UNIQUE (event\_id, section, row\_label, seat\_number)

);



CREATE TABLE orders (

&#x20; id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

&#x20; user\_id BIGINT NOT NULL REFERENCES users(id),

&#x20; status VARCHAR(20) NOT NULL

&#x20;   CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'FAILED')),

&#x20; total\_amount NUMERIC(12,2) NOT NULL CHECK (total\_amount >= 0),

&#x20; payment\_reference VARCHAR(200) UNIQUE,

&#x20; created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);



CREATE TABLE order\_seats (

&#x20; order\_id BIGINT NOT NULL REFERENCES orders(id),

&#x20; seat\_id BIGINT NOT NULL REFERENCES seats(id),

&#x20; price\_at\_purchase NUMERIC(10,2) NOT NULL CHECK (price\_at\_purchase >= 0),

&#x20; PRIMARY KEY (order\_id, seat\_id)

);



CREATE TABLE seat\_holds (

&#x20; id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

&#x20; user\_id BIGINT NOT NULL REFERENCES users(id),

&#x20; seat\_id BIGINT NOT NULL REFERENCES seats(id),

&#x20; expires\_at TIMESTAMPTZ NOT NULL,

&#x20; status VARCHAR(20) NOT NULL

&#x20;   CHECK (status IN ('ACTIVE', 'RELEASED', 'EXPIRED', 'CONVERTED'))

);



CREATE INDEX idx\_events\_status\_start ON events(status, starts\_at);

CREATE INDEX idx\_seats\_event\_status ON seats(event\_id, status);

CREATE INDEX idx\_holds\_seat\_expiry ON seat\_holds(seat\_id, expires\_at);

```



The indexes help find upcoming events, seats for an event, and holds that are approaching expiry. In production, use a transaction-safe allocation table or an appropriate partial unique index to enforce only one active allocation per seat.



\### Example queries



Find events on sale:



```sql

SELECT id, title, venue, starts\_at

FROM events

WHERE status = 'ON\_SALE' AND starts\_at > NOW()

ORDER BY starts\_at

LIMIT 20;

```



Find seats for an event:



```sql

SELECT id, section, row\_label, seat\_number, price, status

FROM seats

WHERE event\_id = 42

ORDER BY section, row\_label, seat\_number;

```



List a user's paid tickets using JOIN:



```sql

SELECT o.id AS order\_id, s.section, s.row\_label,

&#x20;      s.seat\_number, os.price\_at\_purchase

FROM orders o

JOIN order\_seats os ON os.order\_id = o.id

JOIN seats s ON s.id = os.seat\_id

WHERE o.user\_id = 7 AND o.status = 'PAID';

```



\### Preventing double-booking



The database is the final authority on seat ownership. When a user requests a hold, the server begins a transaction and locks the relevant seat rows using `SELECT ... FOR UPDATE`. It checks availability, creates an expiring hold, updates seat status, and commits. A competing transaction must wait and then sees that the seat is no longer available.



When payment succeeds, another transaction verifies the hold, creates the confirmed order-seat allocation, marks the seat sold, and converts the hold. A unique constraint on the active allocation prevents two confirmed orders from owning the same seat. Payment callbacks must be idempotent, and a browser redirect alone must never confirm a sale. Expired or failed holds release the seat safely.



\## 5. Architecture



```text

&#x20;            Customers / Browsers

&#x20;                     |

&#x20;                  DNS / CDN

&#x20;                     |

&#x20;               Waiting Room

&#x20;                     |

&#x20;                Load Balancer

&#x20;                 /          \\

&#x20;                v            v

&#x20;           App Server A  App Server B

&#x20;                 \\          /

&#x20;                  \\        /

&#x20;                   v      v

&#x20;                Cache (event details)

&#x20;                     |

&#x20;                     v

&#x20;              Primary Database

&#x20;              (transactional writes)

&#x20;                     |

&#x20;                Read Replica

&#x20;               (eligible reads)



App Servers ---> Durable Queue ---> Workers

&#x20;                                     |   |

&#x20;                               Ticket/email  Hold expiry



App Servers <------> Payment Provider

```



\### Component explanations



\- \*\*DNS:\*\* Resolves the service name to its entry point.

\- \*\*CDN:\*\* Delivers static files and cacheable event information near users.

\- \*\*Waiting room:\*\* Controls admission during a popular sale to prevent overload.

\- \*\*Load balancer:\*\* Distributes requests across healthy application servers.

\- \*\*App servers:\*\* Authenticate users, validate requests, and run event, hold, order, and payment logic.

\- \*\*Cache:\*\* Speeds up event-detail reads; it is not the authority for seat ownership.

\- \*\*Primary database:\*\* Atomically commits seat holds, orders, and confirmed allocations.

\- \*\*Read replica:\*\* Offloads suitable event and other read queries from the primary.

\- \*\*Durable queue:\*\* Buffers background jobs during traffic spikes.

\- \*\*Workers:\*\* Send ticket confirmations and expire holds, with retries for failures.

\- \*\*Payment provider:\*\* Processes payment and sends server-to-server payment notifications.



\### GET /events flow



1\. The browser requests `GET /api/v1/events`.

2\. DNS and CDN route the request; cached public event data may be served directly.

3\. On a cache miss, the load balancer forwards the request to a healthy app server.

4\. The server reads cache or the read replica.

5\. The server returns paginated event data and may refresh the cache.



\### Hold and purchase flow



1\. The buyer enters the waiting room during a major sale.

2\. The client sends `POST /api/v1/holds` with the chosen seat IDs.

3\. The app server validates the user and starts a primary-database transaction.

4\. The database locks seats, checks availability, creates expiring holds, and commits. Conflicting buyers receive `409 Conflict`.

5\. The client creates an order from the valid hold and begins payment with an idempotency key.

6\. The payment provider processes payment and sends a signed webhook.

7\. The server verifies the webhook and transactionally marks the order paid and seats sold.

8\. A worker sends ticket confirmation. Failed or expired checkout releases seats safely.



\## 6. Trade-offs



\### Fairness versus throughput

A waiting room and rate limits reduce overload and help prevent bots from dominating, but introduce waiting time and limit how quickly buyers enter.



\### Strong consistency versus read performance

Seat claims must use transactional checks on the primary database, which can limit throughput. Event descriptions can be cached and served from replicas, while seat allocation uses strict locking and constraints.



\### Short holds versus convenience

Short holds return seats to the pool quickly but give buyers less time to pay. Longer holds improve convenience but keep scarce seats unavailable for longer.



\### Availability versus safe sales

If the database or payment provider fails, stopping checkout temporarily reduces availability but avoids unreliable or duplicate sales. Browsing can continue in a degraded mode.



\### Avoiding single points of failure

Run multiple app servers behind a health-checking load balancer, use durable replicated queues and workers, configure database backups and tested failover, and monitor dependencies. Redundancy reduces risk but must be paired with recovery tests.



\## Conclusion



TicketHub can handle normal traffic with scalable application servers and can manage popular sales using a waiting room, caching, queues, and read replicas. Most importantly, transactional seat locks, expiring holds, idempotent payment handling, and database constraints prevent two people from buying the same seat.



