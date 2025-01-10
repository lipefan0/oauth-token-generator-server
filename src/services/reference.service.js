// Alternativa com exportações individuais

export async function getPortadores(token) {
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/contas-contabeis', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar portadores');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getFormasPagamento(token) {
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/formas-pagamentos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar formas de pagamento');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getCategorias(token) {
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/categorias/receitas-despesas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar categorias');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getDepositos(token) {
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/depositos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Erro ao buscar depósitos');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getCliente(token, search) {
    try {
        const response = await fetch(`https://www.bling.com.br/Api/v3/contatos?pesquisa=${search}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        // Captura erros HTTP e exibe a resposta para análise
        if (!response.ok) {
            const errorDetails = await response.json().catch(() => response.text());
            console.error('Erro na resposta da API:', errorDetails);
            throw new Error(`Erro da API Bling: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar cliente:', error.message || error);
        throw error;
    }
}
