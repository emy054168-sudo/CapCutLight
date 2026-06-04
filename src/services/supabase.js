import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cyehqffpgvamucqfxvog.supabase.co'; // ← remplace par ta vraie URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZWhxZmZwZ3ZhbXVjcWZ4dm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1Mzc3NTksImV4cCI6MjA5NTExMzc1OX0.XlzXHBwFHVGjHN1A4X7guSXCM2hftNgK0E-u_JLvYn4'; // ← remplace par ta vraie clé

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);