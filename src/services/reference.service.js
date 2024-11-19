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

export async function getEstoque(token) {
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/estoques/saldos?idsProdutos[]=16354146036', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Erro ao buscar estoques');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}