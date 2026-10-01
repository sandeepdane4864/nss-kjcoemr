# NSS Backend (KJCOEMR)

Node + Express + MongoDB API for the NSS unit website and admin panel.

## Setup
1. `cp .env.example .env` and fill `MONGO_URI`, `JWT_SECRET`, Cloudinary keys
2. `npm install`
3. `npm run seed` (placeholder data + super admin from `SEED_ADMIN_*`)
4. `npm run dev` -> http://localhost:5000/api/health

## Roles
`superadmin` > `officer` > `coordinator` (staff) > `volunteer`
- Staff: create/edit content, approve volunteers, issue certificates, record hours
- Officer/superadmin: delete content, bulk approve, edit site settings
- Superadmin: change roles

## Endpoints (all under /api)
| Area | Routes |
|---|---|
| Auth | POST `/auth/register` `/auth/login` `/auth/logout` `/auth/change-password` · GET/PATCH `/auth/me` |
| Volunteers (public) | GET `/users/public` `/users/public/:id` `/users/leaderboard` `/users/blood-donors` |
| My dashboard | GET `/users/me/dashboard` |
| Users (admin) | GET `/users` `/users/:id` · PATCH `/users/:id` `/:id/status` `/:id/role` `/:id/hours` · POST `/users/bulk-approve` · DELETE `/users/:id` |
| Events | GET `/events?status=upcoming\|completed&category&year&q` `/events/:idOrSlug` · POST/PATCH/DELETE · POST `/events/:id/updates` (daily updates) `/events/:id/photos` |
| Registrations | POST/DELETE `/registrations/event/:eventId` · GET `/registrations/me` · GET `/registrations/event/:eventId` (staff) · POST `/registrations/:id/feedback` |
| Gallery | GET `/albums` `/albums/:idOrSlug` · POST/PATCH/DELETE · POST `/albums/:id/photos` |
| Alumni | GET `/alumni` (grouped by year) · CRUD at `/alumni/list` |
| Coordinators | GET `/coordinators` (principal / PO / department-wise / student leads) · CRUD at `/coordinators/list` |
| Notices, Testimonials | CRUD at `/notices`, `/testimonials` |
| Certificates | GET `/certificates/verify/:code` `/certificates/me` · POST `/certificates` `/certificates/event/:eventId` |
| Contact | POST `/contact` · staff: GET `/contact`, PATCH `/contact/:id/read` |
| Site | GET `/settings` `/stats` · PUT `/settings` · GET `/admin/analytics` |
| Uploads | POST `/uploads` (field `file`) · POST `/uploads/multiple` (field `files`, staff) |

Public lists hide unpublished items; staff tokens see everything.
Auth: `Authorization: Bearer <token>` or the httpOnly `token` cookie.
