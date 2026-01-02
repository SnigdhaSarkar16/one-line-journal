
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = (Deno as any).env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      (Deno as any).env.get('SUPABASE_URL') ?? '',
      (Deno as any).env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Robust JSON parsing: read as text first to avoid crashing on empty body
    const bodyText = await req.text();
    let payload: any = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch (e) {
      console.error("Failed to parse JSON body:", e);
      // We continue with an empty payload rather than crashing
    }
    
    const { isTest, email, userName } = payload

    // 2. CASE: Manual Test Button
    if (isTest && email) {
      console.log(`Sending test email to ${email}...`)
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'One Line <onboarding@resend.dev>',
          to: [email],
          subject: 'Your Daily Journal Nudge (Test)',
          html: `
            <div style="font-family: serif; color: #2d3748; max-width: 400px; margin: 0 auto; padding: 40px; border: 1px solid #f3f4f6; border-radius: 20px;">
              <h1 style="font-size: 24px; font-weight: normal; color: #a8a29e; margin-bottom: 24px;">ol.</h1>
              <p style="font-size: 18px; font-style: italic;">Hi ${userName || 'Journaler'},</p>
              <p style="line-height: 1.6;">This is a test of your daily one-line journaling reminder. Your connection is successful!</p>
              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
              <p style="font-size: 12px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.2em;">Quietly Preserving Since 2024</p>
            </div>
          `,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(`Resend Error: ${JSON.stringify(errorData)}`)
      }

      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 3. CASE: Automated Cron Job (Runs every minute)
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, user_name, reminder_time, timezone')
      .eq('email_notifications_enabled', true)

    if (profileError) throw profileError

    const now = new Date()
    const emailPromises = []

    for (const profile of (profiles || [])) {
      if (!profile.email || !profile.reminder_time) continue

      try {
        const userLocalTime = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: profile.timezone || 'UTC'
        }).format(now)

        if (userLocalTime === profile.reminder_time) {
          console.log(`Matching time for ${profile.email} (${userLocalTime})`)
          
          emailPromises.push(
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: 'One Line <onboarding@resend.dev>',
                to: [profile.email],
                subject: 'Time for your one line.',
                html: `
                  <div style="font-family: serif; color: #2d3748; max-width: 400px; margin: 0 auto; padding: 40px; border: 1px solid #f3f4f6; border-radius: 20px;">
                    <h1 style="font-size: 24px; font-weight: normal; color: #a8a29e; margin-bottom: 24px;">ol.</h1>
                    <p style="font-size: 18px; font-style: italic;">Hi ${profile.user_name || 'Journaler'},</p>
                    <p style="line-height: 1.6;">The day is coming to a close. Take a moment to preserve just one line.</p>
                    <div style="margin-top: 32px;">
                      <a href="https://your-app-url.com" style="background: #2d3748; color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Open Journal</a>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
                    <p style="font-size: 10px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.2em;">You received this because you enabled daily nudges.</p>
                  </div>
                `,
              }),
            })
          )
        }
      } catch (tzError: any) {
        console.error(`Timezone error for ${profile.email}:`, tzError.message)
      }
    }

    await Promise.all(emailPromises)

    return new Response(JSON.stringify({ processed: emailPromises.length }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err: any) {
    console.error("Function Error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400 
    })
  }
})
