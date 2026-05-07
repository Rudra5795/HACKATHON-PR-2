import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function removeDemoData() {
  // Demo products are usually IDs 1 through 12, or linked to farmer IDs 1 through 6.
  // Let's delete all products where id <= 12 just to be safe.
  const { data, error } = await supabase
    .from('products')
    .delete()
    .lte('id', 12);
    
  if (error) {
    console.error("Error deleting products:", error);
  } else {
    console.log("Successfully removed demo products (IDs 1-12).");
  }

  // Also verify what products are left
  const { data: remaining, error: err2 } = await supabase.from('products').select('id, name');
  if (err2) console.error(err2);
  else console.log("Remaining products:", remaining);
}

removeDemoData();
