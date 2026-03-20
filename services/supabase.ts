import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swntuyvswzcvnlacsveh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bnR1eXZzd3pjdm5sYWNzdmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDUzOTMsImV4cCI6MjA4OTU4MTM5M30.LltC4kiAgqlaVbGBvfvWJ0Jf8cluuokMuZav1ZJi1v4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
