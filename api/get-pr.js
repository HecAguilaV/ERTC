export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const REPO = 'HecAguilaV/ERTC';
  const pr = req.query.pr;

  if (!pr || !token) {
    return res.status(400).json({ error: 'Missing PR number or GitHub Token.' });
  }

  try {
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ERTC-Serverless-App'
    };

    // Fetch PR details
    const prRes = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr}`, { headers });
    if (!prRes.ok) throw new Error("PR not found");
    const prData = await prRes.json();

    // Fetch PR files to show the diff
    const filesRes = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr}/files`, { headers });
    const filesData = await filesRes.json();

    return res.status(200).json({
      title: prData.title,
      body: prData.body,
      state: prData.state,
      user: prData.user.login,
      html_url: prData.html_url,
      files: filesData.map(f => ({ filename: f.filename, patch: f.patch }))
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || 'Error fetching PR details' });
  }
}
