// Script to check all tests in the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTests() {
    console.log('=== ALL TESTS ===\n');

    const { data: tests, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

    if (testsError) {
        console.error('Error fetching tests:', testsError);
        return;
    }

    console.log(`Found ${tests.length} tests:\n`);
    tests.forEach(test => {
        console.log(`ID: ${test.id}`);
        console.log(`Title: ${test.title}`);
        console.log(`Type: ${test.test_type}`);
        console.log(`Subject: ${test.subject || 'N/A'}`);
        console.log(`Total Questions: ${test.total_questions}`);
        console.log(`Created: ${test.created_at}`);
        console.log('---');
    });

    console.log('\n=== TEST QUESTIONS MAPPING ===\n');

    const { data: testQuestions, error: tqError } = await supabase
        .from('test_questions')
        .select('test_id, question_id, order_index');

    if (tqError) {
        console.error('Error fetching test_questions:', tqError);
        return;
    }

    // Group by test_id
    const byTest = {};
    testQuestions.forEach(tq => {
        if (!byTest[tq.test_id]) byTest[tq.test_id] = [];
        byTest[tq.test_id].push(tq);
    });

    for (const testId of Object.keys(byTest)) {
        const test = tests.find(t => t.id === testId);
        console.log(`Test: ${test?.title || 'UNKNOWN'} (${testId})`);
        console.log(`  Questions linked: ${byTest[testId].length}`);
    }

    console.log('\n=== ORPHANED QUESTIONS (not linked to any test) ===\n');

    const { data: allQuestions, error: qError } = await supabase
        .from('questions')
        .select('*');

    if (qError) {
        console.error('Error fetching questions:', qError);
        return;
    }

    const linkedQuestionIds = new Set(testQuestions.map(tq => tq.question_id));
    const orphaned = allQuestions.filter(q => !linkedQuestionIds.has(q.id));

    console.log(`Found ${orphaned.length} orphaned questions`);
    orphaned.forEach(q => {
        console.log(`  - ${q.id}: ${(q.text || '').substring(0, 50)}...`);
    });
}

checkTests().catch(console.error);
