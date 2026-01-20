// Run SQL migration to add subject column
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log('Adding subject column to tests table...');

    // Try to add the column via raw SQL (this may not work with regular Supabase client)
    // Instead, we'll just update the default in the application

    // For now, let's just check if we can query tests
    const { data: tests, error } = await supabase.from('tests').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Tests table columns:', Object.keys(tests[0] || {}));
    console.log('\nTo add the subject column, run this SQL in your Supabase dashboard:');
    console.log('');
    console.log('ALTER TABLE tests ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT \'full\';');
    console.log('UPDATE tests SET subject = \'full\' WHERE subject IS NULL;');
}

main().catch(console.error);
