// ✅ Supabase Connection

const SUPABASE_URL = "https://rvrjfzetjguhxoizuchx.supabase.co";
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cmpmemV0amd1aHhvaXp1Y2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTMyMzUsImV4cCI6MjA3NjcyOTIzNX0.hO4o3AHLZ-mX3ZCmIOQj5dChWW_Is_dAYp9csmbS9XI";

const { createClient } = supabase;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase Connected");
