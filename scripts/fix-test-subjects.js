// Fix tests to have proper subject field
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    // Update all tests to have subject = 'full' if they don't have one
    const { data: tests, error } = await supabase
        .from('tests')
        .select('id, title, subject')
        .is('subject', null);

    if (error) {
        console.error('Error fetching tests:', error);
        return;
    }

    console.log(`Found ${tests?.length || 0} tests without subject`);

    for (const test of tests || []) {
        console.log(`Updating ${test.title} to have subject 'full'`);
        const { error: updateError } = await supabase
            .from('tests')
            .update({ subject: 'full' })
            .eq('id', test.id);

        if (updateError) {
            console.error(`Error updating ${test.title}:`, updateError);
        }
    }

    console.log('Done!');
}

main().catch(console.error);
