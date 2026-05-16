import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function checkSchema() {
  const { data, error } = await supabase.from('classes').select('gender_requirement').limit(1)
  console.log('Select gender_requirement Result:', error ? error.message : 'Column exists!')
}

checkSchema()
