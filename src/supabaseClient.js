import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqssgnnztrbkxuhuynyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxc3Nnbm56dHJia3h1aHV5bnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTA3MDEsImV4cCI6MjA2MzU4NjcwMX0.c46mETXxIo5Y_an0f_WEFQYQHDHW044V14CGPHP_tAI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 