import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProfileData {
  userEmail: string;
  recipientEmail: string;
  totalSolved: number;
  monthSolved: number;
  streak: number;
  level: number;
  totalXP: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  topicStats: Array<{ topic: string; solved: number; attempted: number }>;
  achievements: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const profileData: ProfileData = await req.json();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>LazyDSA Profile</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 32px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .stat-card.success { border-left-color: #10b981; }
        .stat-card.warning { border-left-color: #f59e0b; }
        .stat-card.danger { border-left-color: #ef4444; }
        .stat-value { font-size: 28px; font-weight: bold; color: #3b82f6; }
        .stat-card.success .stat-value { color: #10b981; }
        .stat-card.warning .stat-value { color: #f59e0b; }
        .stat-card.danger .stat-value { color: #ef4444; }
        .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .topic-list { list-style: none; padding: 0; }
        .topic-list li { padding: 12px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; }
        .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; }
        .progress-fill { background: #3b82f6; height: 100%; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
        .achievement-badge { display: inline-block; background: #fcd34d; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; margin: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LazyDSA Profile</h1>
          <p>DSA Practice Summary for ${profileData.userEmail}</p>
        </div>

        <div class="section">
          <h2>Quick Stats</h2>
          <div class="stats-grid">
            <div class="stat-card success">
              <div class="stat-value">${profileData.totalSolved}</div>
              <div class="stat-label">Questions Solved</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-value">${profileData.monthSolved}</div>
              <div class="stat-label">This Month</div>
            </div>
            <div class="stat-card danger">
              <div class="stat-value">${profileData.streak}</div>
              <div class="stat-label">Current Streak</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">Lvl ${profileData.level}</div>
              <div class="stat-label">${profileData.totalXP.toLocaleString()} XP</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Difficulty Breakdown</h2>
          <div class="stats-grid">
            <div style="grid-column: 1; background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 20px; font-weight: bold; color: #10b981;">${profileData.easyCount}</div>
              <div style="font-size: 12px; color: #6b7280;">Easy</div>
            </div>
            <div style="grid-column: 2; background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-size: 20px; font-weight: bold; color: #f59e0b;">${profileData.mediumCount}</div>
              <div style="font-size: 12px; color: #6b7280;">Medium</div>
            </div>
            <div style="grid-column: 1/3; background: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
              <div style="font-size: 20px; font-weight: bold; color: #ef4444;">${profileData.hardCount}</div>
              <div style="font-size: 12px; color: #6b7280;">Hard</div>
            </div>
          </div>
        </div>

        ${profileData.topicStats.length > 0 ? `
        <div class="section">
          <h2>Top Topics</h2>
          <ul class="topic-list">
            ${profileData.topicStats.map(topic => `
              <li>
                <div>
                  <strong>${topic.topic}</strong>
                  <div class="progress-bar" style="width: 100px; margin-top: 5px;">
                    <div class="progress-fill" style="width: ${(topic.solved / topic.attempted) * 100}%"></div>
                  </div>
                </div>
                <div>${topic.solved}/${topic.attempted} solved</div>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${profileData.achievements > 0 ? `
        <div class="section">
          <h2>Achievements</h2>
          <div style="text-align: center;">
            <div class="achievement-badge">${profileData.achievements} Unlocked</div>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>This profile was shared via LazyDSA - Your DSA Practice Tracker</p>
          <p>Keep practicing and improving your DSA skills!</p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log('Sending email to:', profileData.recipientEmail);
    console.log('From:', profileData.userEmail);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
