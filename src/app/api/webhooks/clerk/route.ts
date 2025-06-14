import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createServerSupabaseClient } from '@/libs/supabase-server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Handle the webhook
  const { type, data } = evt;

  console.warn('Received webhook:', type, data?.id);

  try {
    const supabase = createServerSupabaseClient();

    switch (type) {
      case 'user.created': {
        // Create profile when user signs up
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.id)
          .single();

        if (!existingProfile) {
          await supabase
            .from('profiles')
            .insert({
              id: data.id,
              email: data.email_addresses?.[0]?.email_address,
              full_name: data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : null,
              theme: 'system',
              default_document_ids: [],
              favorite_document_ids: [],
            });

          console.warn('Created profile for user:', data.id);
        }
        break;
      }

      case 'user.updated':
        // Update profile when user data changes
        await supabase
          .from('profiles')
          .update({
            email: data.email_addresses?.[0]?.email_address,
            full_name: data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        console.warn('Updated profile for user:', data.id);
        break;

      case 'user.deleted':
        // Delete profile when user is deleted
        await supabase
          .from('profiles')
          .delete()
          .eq('id', data.id);

        console.warn('Deleted profile for user:', data.id);
        break;

      default:
        console.warn('Unhandled webhook type:', type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
