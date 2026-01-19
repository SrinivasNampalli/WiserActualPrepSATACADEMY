// Simple script to output test data to JSON
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
    const { data: tests } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
    results.tests = tests || [];

    // Get test_questions
    const { data: testQuestions } = await supabase.from('test_questions').select('*');
    results.testQuestions = testQuestions || [];

    // Get questions
    const { data: questions } = await supabase.from('questions').select('*');
    results.questions = questions || [];

    fs.writeFileSync('scripts/db-results.json', JSON.stringify(results, null, 2));
    console.log('Wrote results to scripts/db-results.json');
}

main().catch(console.error);
