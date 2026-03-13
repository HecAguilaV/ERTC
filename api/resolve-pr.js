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
    // 1. Get PR details to know the branch name
    const prDetailsRes = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr_number}`, { headers });
    if (!prDetailsRes.ok) throw new Error("Could not fetch PR details");
    const prData = await prDetailsRes.json();
    const branchName = prData.head.ref;

    // 2. Optionally add a comment
    if (reason) {
      await fetch(`https://api.github.com/repos/${REPO}/issues/${pr_number}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: `**${action.toUpperCase()}**\n\nCurador comenta: ${reason}` })
      });
    }

    let successMessage = "";
    if (action === 'approve') {
      const mergeRes = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr_number}/merge`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ merge_method: 'squash' })
      });
      if (!mergeRes.ok) throw new Error("Error merging PR");
      successMessage = 'PR Approved and Merged';
    } else if (action === 'reject') {
      const closeRes = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr_number}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ state: 'closed' })
      });
      if (!closeRes.ok) throw new Error("Error closing PR");
      successMessage = 'PR Rejected and Closed';
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

    // 3. Delete the temporary branch
    if (branchName && branchName.startsWith('update/')) {
      await fetch(`https://api.github.com/repos/${REPO}/git/refs/heads/${branchName}`, {
        method: 'DELETE',
        headers
      });
      successMessage += `. Temporary branch ${branchName} deleted.`;
    }

    return res.status(200).json({ message: successMessage });

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message || 'Error processing request' });
  }
}
