# Telegram Mini App - Flower Shop

This is a Telegram Mini App for a flower shop, built with Next.js, Supabase, and the Telegram Web App SDK.

## Features

- Product catalog with black, white, and red color scheme
- Shopping cart and order processing
- Order status synchronization between WebApp and Telegram bot
- Admin panel for product management
- Data storage in Supabase (PostgreSQL + Storage)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Telegram Bot (created via BotFather)

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ADMIN_CHAT_ID=your_admin_telegram_id
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

### Deployment

#### Deploying the Next.js app to Vercel

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy

#### Deploying Supabase Edge Functions

The Supabase Edge Functions need to be deployed separately using the Supabase CLI:

1. Install Supabase CLI if you haven't already
2. Login to Supabase CLI:
   \`\`\`
   supabase login
   \`\`\`
3. Link your project:
   \`\`\`
   supabase link --project-ref your-project-ref
   \`\`\`
4. Deploy each function:
   \`\`\`
   supabase functions deploy cart-add
   supabase functions deploy order-confirm
   supabase functions deploy order-edit
   supabase functions deploy order-paid
   \`\`\`

**Important Note:** The Edge Functions in this project use Deno syntax with URL imports. These files are replaced with stubs for Vercel deployment to avoid build errors. The actual function code should be deployed using Supabase CLI.

## Database Structure

- `products`: Store product information
- `orders`: Track customer orders
- `order_items`: Link products to orders
- `admins`: Store admin Telegram IDs

## API Endpoints (Supabase Edge Functions)

- `POST /cart/add`: Add or update items in the cart
- `POST /order/confirm`: Confirm an order
- `POST /order/edit`: Change order status to editing
- `POST /order/paid`: Mark an order as paid

## Telegram Bot Logic

1. `/start` command returns a link to the WebApp
2. Inline buttons in order messages:
   - `pay:{order_id}`: Opens payment
   - `edit:{order_id}`: Allows order editing

## Admin Panel

Access the admin panel at `/admin`. Only users with Telegram IDs in the `admins` table can access it.
