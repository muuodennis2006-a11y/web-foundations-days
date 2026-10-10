

\# Day 7 Assignment: Scaling SnapShare



\## 1. Assumptions



SnapShare is a photo-sharing application where users upload photos and view feeds containing photos from people they follow.



The calculations use these assumptions:



\- Registered users: 10,000,000.

\- Daily active users: 10% of registered users.

\- Each active user uploads one photo per day.

\- Each active user views 50 feed pages per day.

\- Each original photo is 2 MB.

\- Each photo has one thumbnail of 50 KB.

\- A year contains 365 days.

\- Upload and feed-view rates are averaged over 24 hours.

\- Peak traffic is five times the average feed-view rate.

\- For storage estimates, 1 GB = 1,000 MB and 1 TB = 1,000 GB.

\- The storage estimates exclude database records, backups, replication copies, logs and other overhead.



\## 2. Traffic and Storage Calculations



\### Daily Active Users



Daily active users = Registered users × Daily active percentage



= 10,000,000 × 10%



= \*\*1,000,000 daily active users\*\*



\### Photo Uploads Per Day



Each active user uploads one photo daily.



Uploads per day = 1,000,000 × 1



= \*\*1,000,000 uploads per day\*\*



\### Average Uploads Per Second



Average uploads per second = Daily uploads ÷ Seconds per day



= 1,000,000 ÷ 86,400



= \*\*11.57 uploads per second\*\*, approximately 12.



The system should support higher upload rates during busy periods, although the exact upload peak would need traffic measurements.



\### Feed Views Per Day



Each active user views 50 feed pages daily.



Feed views per day = 1,000,000 × 50



= \*\*50,000,000 feed views per day\*\*



\### Average Feed Views Per Second



Average feed views per second = 50,000,000 ÷ 86,400



= \*\*578.70 feed views per second\*\*, approximately 579.



\### Peak Feed Views Per Second



Peak rate = Average rate × 5



= 578.70 × 5



= \*\*2,893.52 feed views per second\*\*, approximately 2,894.



The load balancer and horizontally scalable application servers should handle this peak. Caching and a CDN reduce the work required from application servers and the database.



\### Original Photo Storage Per Year



Daily original photo storage = 1,000,000 × 2 MB



= 2,000,000 MB = 2,000 GB = 2 TB per day.



Annual original photo storage = 2 TB × 365



= \*\*730 TB per year\*\*



\### Thumbnail Storage Per Year



Daily thumbnail storage = 1,000,000 × 50 KB



Using decimal units, 50 KB = 0.05 MB.



Daily thumbnail storage = 1,000,000 × 0.05 MB



= 50,000 MB = 50 GB per day.



Annual thumbnail storage = 50 GB × 365



= \*\*18,250 GB = 18.25 TB per year\*\*



\### Total Photo Storage Per Year



Total = Original photos + Thumbnails



= 730 TB + 18.25 TB



= \*\*748.25 TB per year\*\*



This is approximately 0.75 PB of new photo data annually, before replication, backups and operational overhead. Storage requirements will grow each year as new photos accumulate.



\## 3. Read-Heavy or Write-Heavy?



SnapShare is a \*\*read-heavy system\*\* based on the supplied workload.



There are 50 million feed views per day compared with 1 million photo uploads per day. That means there are 50 feed views for every upload.



The design should prioritize fast feed delivery, caching, CDN distribution and database read replicas. Uploads still require reliable processing and storage, but the larger request volume comes from reading feeds.



\## 4. Where Should Photos Be Stored?



Photo files should be stored in object storage rather than directly inside the relational database.



Object storage services are designed to store large files reliably and scale to very large capacities. They also support durable storage, access controls and integration with CDNs.



The database should store metadata such as the photo ID, owner ID, object-storage key, caption, creation time and visibility settings. This keeps database records smaller and allows metadata queries without transferring large photo files.



\## 5. Architecture Diagram



```text

&#x20;                        USERS

&#x20;                          |

&#x20;                          v

&#x20;                +-------------------+

&#x20;                |    CDN            |

&#x20;                | Cached photos and |

&#x20;                | thumbnails        |

&#x20;                +-------------------+

&#x20;                          |

&#x20;                   Cache miss /

&#x20;                   API requests

&#x20;                          |

&#x20;                          v

&#x20;                +-------------------+

&#x20;                | Load Balancer     |

&#x20;                +-------------------+

&#x20;                          |

&#x20;             +------------+------------+

&#x20;             |            |            |

&#x20;             v            v            v

&#x20;       +-----------+ +-----------+ +-----------+

&#x20;       | App       | | App       | | App       |

&#x20;       | Server 1  | | Server 2  | | Server N  |

&#x20;       +-----------+ +-----------+ +-----------+

&#x20;             |            |            |

&#x20;             +------------+------------+

&#x20;                          |

&#x20;                +---------+----------+

&#x20;                |                    |

&#x20;                v                    v

&#x20;         +-------------+      +-------------+

&#x20;         | Cache       |      | Primary DB  |

&#x20;         | Feed data   |      | Users,      |

&#x20;         | and metadata|      | follows,    |

&#x20;         +-------------+      | photo data  |

&#x20;                              +-------------+

&#x20;                                     |

&#x20;                                     | Replication

&#x20;                                     v

&#x20;                              +-------------+

&#x20;                              | Read Replica|

&#x20;                              | Feed queries|

&#x20;                              +-------------+



Photo upload processing:



&#x20;App Server

&#x20;    |

&#x20;    +------> Object Storage (original photo)

&#x20;    |

&#x20;    +------> Message Queue

&#x20;                   |

&#x20;                   v

&#x20;            +--------------+

&#x20;            | Thumbnail     |

&#x20;            | Worker        |

&#x20;            +--------------+

&#x20;                   |

&#x20;                   v

&#x20;            Object Storage

&#x20;            (thumbnail)

&#x20;                   |

&#x20;                   v

&#x20;                  CDN

```



\## 6. What Each Component Solves



\- \*\*CDN:\*\* Delivers frequently requested photos and thumbnails from locations closer to users, reducing latency and origin traffic.

\- \*\*Load balancer:\*\* Distributes incoming requests across application servers so one server does not handle all traffic.

\- \*\*Application servers:\*\* Handle authentication, permissions, uploads, feed generation, validation and business logic.

\- \*\*Cache:\*\* Stores frequently requested feed data and metadata in fast memory, reducing repeated database queries.

\- \*\*Primary database:\*\* Stores structured information such as users, follows, photo metadata and permissions, and handles reliable writes.

\- \*\*Read replica:\*\* Serves suitable read queries to reduce read pressure on the primary database.

\- \*\*Object storage:\*\* Stores original photos and generated thumbnails as files without placing large binary objects in ordinary database rows.

\- \*\*Message queue:\*\* Holds thumbnail-generation jobs so uploads do not need to wait for image processing to finish.

\- \*\*Thumbnail worker:\*\* Processes queued jobs, creates smaller image versions and stores them in object storage.



\## 7. Photo Upload Flow



1\. A user selects a photo and submits it through the application.

2\. The application server authenticates the user and checks upload permissions, file type and file size.

3\. The server generates a unique photo identifier and stores the original image in object storage.

4\. The server saves the photo metadata and object-storage key in the primary database.

5\. The server adds a thumbnail-generation job to the message queue.

6\. The server responds to the user that the upload has been accepted or completed according to the application's consistency guarantees.

7\. A thumbnail worker retrieves the job from the queue and downloads or reads the original image.

8\. The worker resizes the original image and creates a thumbnail of approximately 50 KB, where feasible.

9\. The worker uploads the thumbnail to object storage and updates the photo metadata to indicate that processing is complete.

10\. The CDN serves the original image or thumbnail when requested, using suitable caching rules and access controls.

11\. If thumbnail generation fails, the job can be retried; repeated failures should be recorded for monitoring and investigation.



The original image should not be considered fully committed unless its storage and metadata operations have succeeded. Because object storage and the database are separate systems, the application needs retry or cleanup handling for partial failures.



\## 8. Trade-Offs



\### Trade-Off 1: Caching Versus Freshness



Caching makes feeds faster and reduces database load, but cached information can become stale when a user uploads a photo, deletes a post or changes visibility settings. The system must use cache invalidation, expiration policies and appropriate permission checks to balance speed with freshness and privacy.



\### Trade-Off 2: Synchronous Versus Asynchronous Thumbnail Generation



Generating thumbnails before responding can make an upload slower because the user must wait for image processing. Using a queue and background worker makes uploads faster, but thumbnails may not be immediately available. The interface should indicate when a thumbnail is still processing.



\### Trade-Off 3: Database Read Replicas Versus Consistency



Read replicas distribute read traffic and reduce the primary database's workload, but replication can lag behind new writes. A newly uploaded photo might not appear immediately in a feed query served by a replica. The application can use the primary database for selected read-after-write operations when stronger consistency is required.



\### Trade-Off 4: CDN Caching Versus Access Control



Public, cacheable images benefit from efficient CDN delivery. Private photos require stricter authorization, signed URLs or signed cookies, and careful cache policies. Stronger access controls add complexity and can reduce caching efficiency if not designed properly.



\### Trade-Off 5: Storage Cost Versus Availability



Replicating objects and maintaining backups improve durability and recovery, but increase storage costs. The system should choose redundancy, retention and backup policies based on the importance of the data and recovery requirements.



\## 9. Conclusion



SnapShare needs a read-optimized architecture because feed views greatly outnumber uploads. A CDN, cache, load balancer, scalable application servers and a database read replica help serve high read traffic. Object storage keeps photo files separate from structured metadata, while a queue and background workers move thumbnail processing out of the critical upload path. Monitoring, retries, access control and capacity planning are necessary as usage grows.

```



\## Step 3 — Commit and push



After saving, return to PowerShell and run:



```powershell

cd C:\\Users\\Denno\\Desktop\\web-foundations-days

git add day7/photo-app-scaling.md

git commit -m "Day 7 assignment"

git push

```



If Git reports there is no upstream branch, run:



```powershell

git push -u origin main

```



Verify your status:



```powershell

git status

```



You should see `nothing to commit, working tree clean`.



\## Step 4 — Final check



\- \[ ] `day7/photo-app-scaling.md` exists.

\- \[ ] The calculations include average and peak feed views.

\- \[ ] The diagram includes every required component.

\- \[ ] The upload flow and at least two trade-offs are explained.

\- \[ ] The commit has been pushed to GitHub.



\*\*Important calculation to remember:\*\* 1 million daily active users generate 1 million uploads and 50 million feed views each day. That's about \*\*12 uploads per second\*\*, \*\*579 average feed views per second\*\*, and \*\*2,894 peak feed views per second\*\*.



Once you've pushed, Day 7's written assignment is ready to submit.

