import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Notification {
  id: string;
  recipient_id: string;
  task_id: string;
  title: string;
  message: string;
  author_name: string;
  status: string;
  retry_count: number;
  team_members: {
    email: string;
    short_name: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured');
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase credentials not configured');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query pending notifications (max 10 per batch)
    const { data: notifications, error: queryError } = await supabase
      .from('notifications')
      .select(`
        id, recipient_id, task_id, title, message, author_name,
        status, retry_count,
        team_members!recipient_id(email, short_name)
      `)
      .eq('status', 'PENDING')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (queryError) throw new Error(`Query error: ${queryError.message}`);

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending notifications' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Processing ${notifications.length} pending comment notifications`);

    let successCount = 0;
    let failCount = 0;
    const trackerUrl = Deno.env.get('PROJECT_URL') || 'https://plan-30-dias.vercel.app';

    for (const notification of notifications as Notification[]) {
      try {
        const recipientEmail = notification.team_members?.email;
        const recipientName = notification.team_members?.short_name || 'Equipo';

        if (!recipientEmail) {
          console.warn(`⚠️ No email for recipient ${notification.recipient_id}, skipping`);
          await supabase.from('notifications').update({ status: 'FAILED', error_message: 'No email' }).eq('id', notification.id);
          failCount++;
          continue;
        }

        const emailHtml = buildEmailTemplate(notification, recipientName, trackerUrl);

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Sprint Tracker <notifications@notifications.laneta.com>',
            to: recipientEmail,
            subject: notification.title,
            html: emailHtml,
          }),
        });

        if (resendResponse.ok) {
          await supabase.from('notifications')
            .update({ status: 'SENT', sent_at: new Date().toISOString() })
            .eq('id', notification.id);
          successCount++;
          console.log(`✅ Sent to ${recipientEmail} (${notification.id})`);
        } else {
          const errorData = await resendResponse.json();
          throw new Error(`Resend error: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        const newRetryCount = notification.retry_count + 1;
        await supabase.from('notifications')
          .update({
            retry_count: newRetryCount,
            status: newRetryCount >= 3 ? 'FAILED' : 'PENDING',
            error_message: error.message,
          })
          .eq('id', notification.id);
        failCount++;
        console.error(`❌ Failed (${notification.id}): ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: notifications.length, sent: successCount, failed: failCount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildEmailTemplate(notification: Notification, recipientName: string, trackerUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notification.title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .emoji { font-size: 40px; text-align: center; margin-bottom: 16px; }
    .title { font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 8px; text-align: center; }
    .subtitle { font-size: 14px; color: #718096; text-align: center; margin-bottom: 24px; }
    .comment-box { background-color: #f7fafc; border-left: 4px solid #6366f1; padding: 16px; margin-bottom: 24px; border-radius: 4px; }
    .comment-author { font-weight: 600; color: #2d3748; margin-bottom: 6px; font-size: 14px; }
    .comment-text { color: #4a5568; font-size: 14px; line-height: 1.6; }
    .task-info { font-size: 13px; color: #718096; margin-bottom: 24px; }
    .task-info strong { color: #2d3748; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .footer { padding: 20px; text-align: center; background-color: #f7fafc; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 4px 0; font-size: 12px; color: #a0aec0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sprint Tracker — Equipo 3</h1>
    </div>
    <div class="content">
      <div class="emoji">💬</div>
      <div class="title">Nuevo comentario en ${notification.task_id}</div>
      <div class="subtitle">Hola ${recipientName}, hay actividad en una tarea tuya</div>
      <div class="comment-box">
        <div class="comment-author">${notification.author_name} escribió:</div>
        <div class="comment-text">${notification.message}</div>
      </div>
      <div class="task-info">
        <strong>Tarea:</strong> ${notification.task_id}
      </div>
      <center>
        <a href="${trackerUrl}" class="button">Abrir Tracker →</a>
      </center>
    </div>
    <div class="footer">
      <p>Sprint 30 días — Equipo 3 Infraestructura</p>
      <p>Este email fue enviado automáticamente. No respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
