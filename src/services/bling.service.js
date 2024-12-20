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

// src/services/bling.service.js
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

        const responseText = await response.text();
        console.log('Resposta bruta do Bling:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Erro ao processar resposta: ${responseText}`);
        }

        // Log do objeto data completo
        console.log('Dados do token:', data);

        // Verifica se temos os dados necessários
        if (!data.access_token) {
            throw new Error('Token não recebido do Bling');
        }

        // Retorna o objeto completo
        return data;
    } catch (error) {
        console.error('Erro completo:', error);
        throw new Error(error.message || 'Erro ao trocar token');
    }
}