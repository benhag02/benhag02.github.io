import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://ojnkqqphpsxxjfyrfviy.supabase.co'
const supabaseKey = 'sb_publishable_5nB7dT8aWlWLeElo-mFuWg_ALnMVjhG'

export const supabase = createClient(supabaseUrl, supabaseKey)
