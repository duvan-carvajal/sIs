import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://jspcrxxhteejkaaowryi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcGNyeHhodGVlamthYW93cnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTk2MTgsImV4cCI6MjA3OTMzNTYxOH0.mbuee0AO9bHXxt3EOb74GKPGKAM_wUDbfroauwfcUo4';

export const supabase = createClient(supabaseUrl, supabaseKey);
