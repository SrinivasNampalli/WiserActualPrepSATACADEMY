// Comprehensive check of database state
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const results = {};

    // Get tests
    const { data: tests, error: testsError } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
    results.tests = { data: tests || [], error: testsError?.message };
    console.log(`Tests: ${tests?.length || 0} found`);

    // Get profiles (users)
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
    results.profiles = { data: profiles || [], error: profilesError?.message };
    console.log(`Profiles: ${profiles?.length || 0} found`);

    // Get test_questions
    const { data: testQuestions, error: tqError } = await supabase.from('test_questions').select('*');
    results.testQuestions = { data: testQuestions || [], error: tqError?.message };
    console.log(`Test Questions Links: ${testQuestions?.length || 0} found`);

    // Get questions
    const { data: questions, error: qError } = await supabase.from('questions').select('*');
    results.questions = { data: questions || [], error: qError?.message };
    console.log(`Questions: ${questions?.length || 0} found`);

    // Show profiles details
    console.log('\n=== PROFILES (Users) ===');
    if (profiles && profiles.length > 0) {
        profiles.forEach(p => {
            console.log(`  - ${p.full_name || 'No name'} (${p.email || p.id})`);
        });
    } else {
        console.log('  No profiles found!');
    }

    // Show tests details
    console.log('\n=== TESTS ===');
    if (tests && tests.length > 0) {
        tests.forEach(t => {
            console.log(`  - ${t.title} (${t.test_type}, ${t.subject || 'no subject'})`);
        });
    } else {
        console.log('  No tests found!');
    }

    fs.writeFileSync('scripts/full-db-check.json', JSON.stringify(results, null, 2));
    console.log('\nFull results saved to scripts/full-db-check.json');
}

main().catch(console.error);
