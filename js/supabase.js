import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

      export const supabase = createClient(
        "https://nlwvesfbasdqnxsgvfkj.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd3Zlc2ZiYXNkcW54c2d2ZmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDg3ODAsImV4cCI6MjA5NTI4NDc4MH0.4HlnpeqjKkks5eslpHItSbPcjxBKcO-2FMtro7MdTcY",
      );

// Récupérer la session après redirection OAuth
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  // Pas connecté → renvoyer vers la page de login
  window.location.href = "/";
}