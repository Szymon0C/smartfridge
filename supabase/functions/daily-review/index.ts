import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const soonDate = twoDaysFromNow.toISOString().split('T')[0];

    const { data: expiring } = await supabase
      .from('products')
      .select('household_id, name, expiry_date')
      .eq('status', 'active')
      .lte('expiry_date', soonDate);

    if (!expiring || expiring.length === 0) {
      return new Response(JSON.stringify({ message: 'No expiring products' }), { status: 200 });
    }

    const byHousehold: Record<string, { expired: string[]; expiringSoon: string[] }> = {};
    for (const p of expiring) {
      if (!byHousehold[p.household_id]) {
        byHousehold[p.household_id] = { expired: [], expiringSoon: [] };
      }
      if (p.expiry_date <= today) {
        byHousehold[p.household_id].expired.push(p.name);
      } else {
        byHousehold[p.household_id].expiringSoon.push(p.name);
      }
    }

    for (const [householdId, counts] of Object.entries(byHousehold)) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, keys')
        .eq('household_id', householdId);

      if (!subs || subs.length === 0) continue;

      const parts: string[] = [];
      if (counts.expired.length > 0) parts.push(`${counts.expired.length} przeterminowanych`);
      if (counts.expiringSoon.length > 0) parts.push(`${counts.expiringSoon.length} do zjedzenia`);
      const body = `Masz ${parts.join(', ')}.`;

      for (const sub of subs) {
        try {
          console.log(`Push to ${sub.endpoint}: ${body}`);
        } catch (e) {
          console.error('Push failed:', e);
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Notifications sent' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
