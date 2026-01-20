// Check actual columns in tests table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const { data: tests, error } = await supabase.from('tests').select('*').limit(1);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!tests || tests.length === 0) {
        console.log('No tests in database');
        return;
    }

    console.log('Columns in tests table:');
    Object.keys(tests[0]).forEach(col => console.log(`  - ${col}: ${tests[0][col]}`));

    console.log('\nSubject column exists:', 'subject' in tests[0]);
}

main().catch(console.error);
