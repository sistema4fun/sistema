import { createClient } from '@supabase/supabase-js'

// pega as variáveis que estão no .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// cria o cliente do supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
