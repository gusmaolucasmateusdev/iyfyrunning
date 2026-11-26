
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://nbucwdjhdgplafzzitfi.supabase.co';

// Cole aqui sua Publishable key, que você salvou no Bloco de Notas.
const supabasePublishableKey = 'sb_publishable_zvbrTGXgwwQUfWt6AYHlwA_8fopS1f9';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);