import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite's public environment configuration.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize and export the single database connection client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
