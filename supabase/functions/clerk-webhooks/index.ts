import { verifyWebhook } from 'npm:@clerk/backend/webhooks';
import { createClient } from 'npm:@supabase/supabase-js';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import 'https://deno.land/std@0.224.0/dotenv/load.ts';

Deno.serve(async (req) => {
  try {
    // Verify webhook signature
    const webhookSecret = Deno.env.get('CLERK_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return new Response('Webhook secret not configured', { status: 500 });
    }

    // Verify the webhook using Clerk's verifyWebhook function
    let event;
    try {
      event = await verifyWebhook(req, { signingSecret: webhookSecret });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    // Create supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response('Supabase credentials not configured', { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'user.created': {
        const { data: profile, error } = await supabase
          .from('profiles')
          .insert([
            {
              id: event.data.id,
              email: event.data.email_addresses?.[0]?.email_address || null,
              first_name: event.data.first_name || null,
              last_name: event.data.last_name || null,
              full_name: event.data.first_name && event.data.last_name
                ? `${event.data.first_name} ${event.data.last_name}`.trim()
                : event.data.first_name || null,
              theme: 'system',
              default_document_ids: [],
              favorite_document_ids: [],
              created_at: new Date(event.data.created_at).toISOString(),
              updated_at: new Date(event.data.updated_at).toISOString(),
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        console.warn('✅ Created user profile for:', event.data.id);
        return new Response(JSON.stringify({ profile }), { status: 200 });
      }

      case 'user.updated': {
        const { data: profile, error } = await supabase
          .from('profiles')
          .update({
            email: event.data.email_addresses?.[0]?.email_address || null,
            first_name: event.data.first_name || null,
            last_name: event.data.last_name || null,
            full_name: event.data.first_name && event.data.last_name
              ? `${event.data.first_name} ${event.data.last_name}`.trim()
              : event.data.first_name || null,
            updated_at: new Date(event.data.updated_at).toISOString(),
          })
          .eq('id', event.data.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user profile:', error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        console.warn('✅ Updated user profile for:', event.data.id);
        return new Response(JSON.stringify({ profile }), { status: 200 });
      }

      case 'user.deleted': {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', event.data.id);

        if (error) {
          console.error('Error deleting user profile:', error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        console.warn('✅ Deleted user profile for:', event.data.id);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }

      default:
        console.warn('Unhandled webhook event type:', event.type);
        return new Response('Webhook event not handled', { status: 200 });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
