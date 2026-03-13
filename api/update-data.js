export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const adminSecret = process.env.ADMIN_SECRET;
  const REPO = 'HecAguilaV/ERTC';

  if (!token) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${adminSecret}` || !adminSecret) {
    return res.status(401).json({ error: 'Unauthorized: Admin Token Required' });
  }

  const payload = req.body;
  const { type } = payload;

  let filePath = '';
  let commitMessage = '';
  let updateLogic = null;

  if (type === 'synergy') {
    const { memberA, memberB, level, text, result } = payload;
    if (!memberA || !memberB) return res.status(400).json({ error: 'Missing members' });
    
    filePath = 'src/data/synergies.json';
    commitMessage = `Admin: Actualizada sinergia entre ${memberA} y ${memberB}`;
    
    updateLogic = (currentData) => {
      const data = currentData || {};
      const key = `${memberA}-${memberB}`;
      data[key] = { level, text, result };
      return data;
    };
  } else {
    return res.status(400).json({ error: 'Invalid update type' });
  }

  try {
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ERTC-Serverless-App'
    };

    // 1. Get current file
    const fileRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}?ref=Sistema_Operativo_ERTC`, { headers });
    let currentContent = {};
    let sha = null;

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
      const content = Buffer.from(fileData.content, 'base64').toString('utf8');
      currentContent = JSON.parse(content);
    }

    // 2. Apply updates
    const updatedContent = updateLogic(currentContent);
    const updatedBase64 = Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64');

    // 3. Commit to Sistema_Operativo_ERTC
    const commitRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        content: updatedBase64,
        branch: 'Sistema_Operativo_ERTC',
        sha: sha
      })
    });

    if (!commitRes.ok) {
      const err = await commitRes.text();
      throw new Error(`GitHub Commit Failed: ${err}`);
    }

    const commitData = await commitRes.json();
    return res.status(200).json({ 
      success: true, 
      message: 'Data updated successfully in Sistema_Operativo_ERTC.',
      commit: commitData.commit.html_url 
    });

  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
