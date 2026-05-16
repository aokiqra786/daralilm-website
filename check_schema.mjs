import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function checkSchema() {
  const { data, error } = await supabase.from('class_enrollments').select('*').limit(1)
  console.log('class_enrollments:', error ? error.message : 'exists')

  const { data: d2, error: e2 } = await supabase.from('classes').select('*').limit(1)
  console.log('classes:', e2 ? e2.message : 'exists')
}

checkSchema()
