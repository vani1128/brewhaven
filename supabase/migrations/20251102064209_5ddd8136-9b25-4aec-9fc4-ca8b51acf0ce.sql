-- Add missing featured column to coffees table
ALTER TABLE public.coffees 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add missing inventory column if not exists
ALTER TABLE public.coffees 
ADD COLUMN IF NOT EXISTS inventory INTEGER DEFAULT 0;

-- Add missing price column if not exists
ALTER TABLE public.coffees 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 100.00;