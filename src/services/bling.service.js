export async function verifyToken(token) {
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/contatos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        return response.status === 200;
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
}

export async function exchangeToken(code, clientId, clientSecret, redirectUri) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            }).toString()
        });

        if (!response.ok) {
            throw new Error('Failed to exchange token');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}