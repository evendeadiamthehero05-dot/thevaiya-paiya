const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const db = createClient(supabaseUrl, supabaseServiceKey);

// Sample classroom-safe dares
const dares = [
  { text: 'Sing the alphabet backwards', classroom_safe: true },
  { text: 'Do your best impression of a famous person', classroom_safe: true },
  { text: 'Tell a funny joke', classroom_safe: true },
  { text: 'Do 10 pushups', classroom_safe: true },
  { text: 'Speak in an accent for 1 minute', classroom_safe: true },
  { text: 'Describe your room without laughing', classroom_safe: true },
  { text: 'Do a silly dance for 15 seconds', classroom_safe: true },
  { text: 'Tell us your most embarrassing story', classroom_safe: true },
  { text: 'Pretend to be a phone operator', classroom_safe: true },
  { text: 'Recite a poem or song lyric backwards', classroom_safe: true },
  { text: 'Do an animal impression for 20 seconds', classroom_safe: true },
  { text: 'Hug the nearest person', classroom_safe: true },
  { text: 'Compliment three people in the room', classroom_safe: true },
  { text: 'Do your best celebrity walk', classroom_safe: true },
  { text: 'Say a tongue twister 3 times fast', classroom_safe: true },
  { text: 'Tell a terrible pun', classroom_safe: true },
  { text: 'Do 20 jumping jacks', classroom_safe: true },
  { text: 'Speak only in questions for 1 minute', classroom_safe: true },
  { text: 'Pretend to be a news reporter', classroom_safe: true },
  { text: 'Do a handstand against the wall', classroom_safe: true },
];

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing Supabase database...');

    // Create dares table if it doesn't exist
    const { error: createTableError } = await db.rpc('create_tables_if_not_exists');
    
    // Insert dares
    const { error: insertError, data } = await db
      .from('dares')
      .insert(
        dares.map((dare) => ({
          text: dare.text,
          classroom_safe: dare.classroom_safe,
          used_count: 0,
          created_at: new Date().toISOString(),
        }))
      );

    if (insertError && insertError.code !== '23505') {
      // 23505 = unique constraint, means already inserted
      console.error('❌ Error inserting dares:', insertError);
    } else {
      console.log('✅ Database initialized with', dares.length, 'dares');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
