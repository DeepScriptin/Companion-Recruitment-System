
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibhwfuvkyaiofzueeoka.supabase.co';
const supabaseKey = 'sb_publishable_eolAZDGYdOrn7mu6Gydehw_scE989G7';

export const supabase = createClient(supabaseUrl, supabaseKey);
