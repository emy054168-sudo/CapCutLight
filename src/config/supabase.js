import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
'https://cyehqffpgvamucqfxvog.supabase.co/rest/v1/'

const SUPABASE_ANON_KEY =
'sb_publishable_t0Ulurroe01M7DxI8N2Qcg_MJXduplL'

export const supabase =
createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)