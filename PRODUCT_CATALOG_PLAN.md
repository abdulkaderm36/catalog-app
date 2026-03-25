# Product Catalog App Plan

## Overview

This app is a product catalog platform where a company can:

- sign up and log in
- access an authenticated dashboard
- add and manage products
- publish a public-facing catalog at `/catalog/:companySlug`

The goal is to keep the MVP focused while leaving room for analytics, branding, and richer product discovery later.

## Core User Flow

1. A user signs up with:
   - name
   - company name
   - company slug
   - email
   - password
   - confirm password
2. The user logs in with:
   - email
   - password
3. After authentication, the user lands on the dashboard.
4. From the dashboard, the user can:
   - view analytics
   - add products
   - manage existing products
   - update company settings
5. The company gets a public catalog route:
   - `/catalog/:companySlug`

## Product Requirements

### Required Fields

- title
- description
- price
- images

### Product Rules

- maximum 10 images per product
- maximum 10 MB per image
- price should still be stored even if public display is disabled

### Recommended Additional Fields

These fields will make the catalog much more usable:

- `sku`
- `category`
- `tags`
- `status` (`draft`, `published`, `archived`)
- `slug`
- `is_featured`
- `inventory_status` (`in_stock`, `out_of_stock`, `preorder`) if relevant
- `external_url` or `cta_link`
- `sort_order`
- `seo_title`
- `seo_description`

### Important Product Decisions

- one image should be marked as the cover image
- images should be reorderable
- products should support `draft` and `published` states from day one
- soft delete is preferable to hard delete

## Dashboard Scope

### MVP Analytics

For the first version, keep analytics limited to catalog activity the app directly owns:

- total products
- published products
- total catalog views
- total product views
- top viewed products
- recent visits
- CTA clicks if external links are enabled

### Clarification Needed

The phrase "website traffic" should be defined clearly. It can mean:

- traffic to the public catalog pages
- traffic to a separate marketing website

For MVP, analytics should focus on the public catalog and product pages.

## Public Catalog

### Route

- `/catalog/:companySlug`

### UI Direction

Use a card-based layout where:

- the product image takes most of the card space
- the title appears below the image
- the description appears below the title
- content is vertically aligned

### Recommendations

- use equal-height cards
- clamp long descriptions
- add search early
- add category/tag filters early
- support sorting later if needed

### Future Expansion

Consider a product detail route later:

- `/catalog/:companySlug/:productSlug`

## Authentication and Security

The app should use JWT-based authentication, but the implementation should be stricter than a basic localStorage token setup.

### Recommended Auth Model

- short-lived access token
- refresh token
- refresh token stored in `HttpOnly`, `Secure`, `SameSite` cookie
- JWT signing with `jose`
- password hashing with `argon2`

### Protected Frontend Routes

- `/dashboard`
- `/products`
- `/products/new`
- `/products/:id/edit`
- `/settings`

### Public Frontend Route

- `/catalog/:companySlug`

### Required Auth Features

- signup
- login
- logout
- token refresh

### Strongly Recommended Features

- email verification
- forgot password
- reset password
- auth rate limiting

## Route Plan

### Frontend Routes

- `/signup`
- `/login`
- `/dashboard`
- `/products`
- `/products/new`
- `/products/:id/edit`
- `/settings`
- `/catalog/:companySlug`

### Backend API Routes

#### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /me`

#### Products

- `GET /products`
- `POST /products`
- `GET /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `POST /products/:id/images`
- `DELETE /products/:id/images/:imageId`

#### Public Catalog

- `GET /catalog/:companySlug`

#### Analytics

- `GET /analytics/overview`
- `GET /analytics/products`

#### Settings

- `GET /settings`
- `PATCH /settings`

## Recommended Stack

### Frontend

- React
- shadcn/ui
- `@tanstack/react-query`
- `react-hook-form`
- `zod`

### Frontend App Choice

Two reasonable options:

#### Option 1: React + Vite

Use this if:

- the app is mostly dashboard-driven
- SEO for the public catalog is not critical
- you want a simpler split between FE and Hono API

#### Option 2: Next.js

Use this if:

- the public catalog should be SEO-friendly
- you expect search/discovery to matter
- you want server rendering for public catalog pages

If public discovery matters, Next.js is the better frontend choice.

### Backend

- Hono API
- PostgreSQL
- Drizzle ORM
- `zod`
- `jose`
- `argon2`

## File Storage and Uploads

### Recommended Storage Options

- AWS S3
- Cloudflare R2
- Supabase Storage

### Recommended Libraries

- `@aws-sdk/client-s3`
- `sharp`

### Upload Handling Notes

- validate MIME type and file size on both client and server
- generate optimized image variants
- store original plus resized versions if needed
- support cover image selection

## Email Recommendations

### Recommended Providers

- Resend
- Postmark

### Recommended Email Templating

- React Email

### Default Recommendation

- `Resend + React Email`

This is a strong default for signup flows, email verification, and password reset emails.

## Suggested Data Model

The MVP likely needs the following tables:

- `users`
- `companies`
- `company_settings`
- `products`
- `product_images`
- `analytics_events`
- `refresh_tokens` or `sessions`

### Core Relationships

- one company has many products
- one company has one settings record
- one product has many images
- one company has one or more users depending on product direction

## Important Decisions Still Open

These should be finalized before implementation:

- can a company have multiple users or only one owner?
- can `company_name` be changed later?
- should `company_slug` be immutable after creation?
- should slugs be globally unique?
- should products support draft and published states?
- should products support soft delete?
- should the catalog support search from MVP?
- should the catalog support filtering from MVP?
- should there be branding controls for each company?
- should there be custom domains later?

## Better Suggestions / Adjustments

- use `company_slug` in URLs instead of raw company name
- keep price in the schema even if it is hidden publicly
- add `status`, `slug`, and `cover_image` support from the start
- build simple app-owned analytics first instead of overbuilding a full analytics engine
- add image optimization from the first implementation
- plan for password reset and email verification early even if they ship in phase 2

## Proposed Delivery Phases

### Phase 1

- authentication
- company creation
- dashboard shell
- product CRUD
- image upload
- public catalog page

### Phase 2

- analytics
- search and filtering
- company settings
- price visibility toggle
- email verification
- forgot/reset password

### Phase 3

- product detail pages
- richer SEO
- multi-user teams
- advanced analytics
- custom branding
- custom domains

## Summary

The current concept is solid for an MVP. The highest-value improvements are:

- introduce `company_slug`
- add stronger product metadata
- use draft/published states
- implement JWT with refresh token cookies
- keep analytics scoped to catalog behavior first
- choose frontend architecture based on whether public catalog SEO matters

