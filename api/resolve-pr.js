export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const adminSecret = process.env.ADMIN_SECRET;
  const REPO = 'HecAguilaV/ERTC';

  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${adminSecret}` || !adminSecret) {
    return res.status(401).json({ error: 'Unauthorized Access. Curator specific endpoint.' });
  }

  const { pr_number, action, reason } = req.body;
  if (!pr_number || !action) {
    return res.status(400).json({ error: 'pr_number and action are required' });
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ERTC-Serverless-App'
  };

  try {
    // Optionally add a comment
    if (reason) {
      await fetch(`https://api.github.com/repos/${REPO}/issues/${pr_number}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: `**${action.toUpperCase()}**\n\nCurador comenta: ${reason}` })
      });
    }

    if (action === 'approve') {
      const mergeRes = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr_number}/merge`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ merge_method: 'squash' })
      });
      if (!mergeRes.ok) throw new Error("Error merging PR");
      return res.status(200).json({ message: 'PR Approved and Merged' });
    } 
    
    if (action === 'reject') {
      const closeRes = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr_number}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ state: 'closed' })
      });
      if (!closeRes.ok) throw new Error("Error closing PR");
      return res.status(200).json({ message: 'PR Rejected and Closed' });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message || 'Error processing request' });
  }
}
