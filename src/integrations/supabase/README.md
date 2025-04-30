
# Supabase Database Schema

## Tables

### profiles
- id (uuid, primary key, references auth.users)
- username (text, nullable)
- avatar_url (text, nullable)
- created_at (timestamp with time zone, not null, default: now())
- updated_at (timestamp with time zone, not null, default: now())

### income
- id (uuid, primary key, default: gen_random_uuid())
- user_id (uuid, not null, references auth.users)
- amount (numeric, not null)
- date (timestamp with time zone, not null, default: now())
- description (text, nullable)
- created_at (timestamp with time zone, not null, default: now())
- updated_at (timestamp with time zone, not null, default: now())

### expenses
- id (uuid, primary key, default: gen_random_uuid())
- user_id (uuid, not null, references auth.users)
- amount (numeric, not null)
- category (text, not null)
- description (text, nullable)
- date (timestamp with time zone, not null, default: now())
- created_at (timestamp with time zone, not null, default: now())
- updated_at (timestamp with time zone, not null, default: now())

### saving_goals
- id (uuid, primary key, default: gen_random_uuid())
- user_id (uuid, not null, references auth.users)
- title (text, not null)
- target_amount (numeric, not null)
- current_amount (numeric, not null, default: 0)
- deadline (timestamp with time zone, nullable)
- created_at (timestamp with time zone, not null, default: now())
- updated_at (timestamp with time zone, not null, default: now())

### loans
- id (uuid, primary key, default: gen_random_uuid())
- user_id (uuid, not null, references auth.users)
- title (text, not null)
- total_amount (numeric, not null)
- remaining_amount (numeric, not null)
- monthly_payment (numeric, not null)
- due_day (integer, not null)
- next_payment_date (timestamp with time zone, not null)
- created_at (timestamp with time zone, not null, default: now())
- updated_at (timestamp with time zone, not null, default: now())

### budget_categories
- id (uuid, primary key, default: gen_random_uuid())
- user_id (uuid, not null, references auth.users)
- category (text, not null)
- amount (numeric, not null)
- percentage (numeric, not null)
- created_at (timestamp with time zone, not null, default: now())
- updated_at (timestamp with time zone, not null, default: now())
- UNIQUE constraint on (user_id, category)

## RLS Policies

All tables have RLS policies that ensure users can only access their own data.
