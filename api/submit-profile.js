export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const adminSecret = process.env.ADMIN_SECRET;
  const REPO = 'HecAguilaV/ERTC';

  if (!token) {
    console.error("Missing GITHUB_TOKEN");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { id, name, role, capabilities, unique, icon, autoMerge } = req.body;

  // 1. Basic Validation
  if (!id || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const payloadStr = JSON.stringify(req.body);
  if (payloadStr.length > 2000) { // Safety limit to avoid huge CVs
    return res.status(400).json({ error: 'Payload too large. Exceeds max characters.' });
  }

  const authHeader = req.headers.authorization || '';
  const isDirectAdmin = authHeader === `Bearer ${adminSecret}` && !!adminSecret;
  const bypassPR = isDirectAdmin || autoMerge; // If autoMerge is requested from Matriz Quick Attach

  const branchName = bypassPR ? 'Marketplace_Editable' : `update/profile-${id}-${Date.now()}`;
  const filePath = `src/data/profiles/${id}.json`;
  
  // Clean Data Object
  const profileData = {
    id, name, role, icon: icon || '👤', status_action: true,
    capabilities: capabilities || [],
    unique: unique || '',
    needsCount: capabilities && capabilities[0] ? capabilities[0].needsIds.length : 0 
  };

  const fileContentBase64 = Buffer.from(JSON.stringify(profileData, null, 2)).toString('base64');

  try {
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ERTC-Serverless-App'
    };

    // 2. Get target branch sha if we need to branch out
    if (!bypassPR) {
      const refRes = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/Marketplace_Editable`, { headers });
      const refData = await refRes.json();
      const baseSha = refData.object.sha;

      // Create new branch
      const branchRes = await fetch(`https://api.github.com/repos/${REPO}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha })
      });
      if (!branchRes.ok) throw new Error("Could not create branch");
    }

    // 3. Check if file exists to get its SHA (required for updating existing files)
    const fileRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${branchName}`, { headers });
    let fileSha = null;
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      fileSha = fileData.sha;
    }

    // 4. Create or Update File
    const commitRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: bypassPR ? `Admin: Inyección directa de ${name}` : `Propuesta: Edición de perfil ${name}`,
        content: fileContentBase64,
        branch: branchName,
        sha: fileSha
      })
    });
    
    if (!commitRes.ok) {
      const errDetail = await commitRes.text();
      console.error(errDetail);
      throw new Error("Could not commit file");
    }
    
    const commitData = await commitRes.json();

    // 5. If bypassing PR (Admin or Quick-Attach Auto Merge), we are done.
    if (bypassPR) {
      return res.status(200).json({ 
        message: 'Profile injected directly to core (Marketplace_Editable).',
        commit_url: commitData.commit.html_url
      });
    }

    // 6. If Regular User Edit, Create PR
    const prRes = await fetch(`https://api.github.com/repos/${REPO}/pulls`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: `Actualizaci\u00f3n de Perfil: ${name}`,
        head: branchName,
        base: 'Marketplace_Editable',
        body: `Propuesta de actualizaci\u00f3n de expertise.\n\nAutor declaro: ${name}`
      })
    });

    if (!prRes.ok) throw new Error("Could not create PR");

    const prData = await prRes.json();

    return res.status(200).json({ 
      pr_url: prData.html_url,
      pr_number: prData.number,
      message: 'Pull Request sent' 
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || 'Error processing request' });
  }
}
