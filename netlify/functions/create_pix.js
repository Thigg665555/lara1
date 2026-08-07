exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const bodyData = JSON.parse(event.body || '{}');
        const preco = bodyData.preco || 19.90;
        const tracking = bodyData.tracking || null;

        // 1. Base URL correta informada pelo suporte
        const PARADISEPAGS_API_URL = "https://multi.paradisepags.com/api/v1/transaction.php"; 
        
        // Mantenha a sua chave atual (agora vai funcionar com o header correto!)
        const TOKEN = "sk_e2534c5d49d754f6dab7036bc14c3fabea6ed027f40c4d7f17a3c9ab3131137f"; 
        const PRODUCT_HASH = "prod_0d044a7710f1c8a0"; 

        // Gerar referência única obrigatória
        const reference = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        // Gerar email único caso não venha do front (regra obrigatória da Paradise)
        const randomEmail = `cliente_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@mail.com`;

        const payload = {
            amount: Math.round(preco * 100), // Valor em centavos
            description: "Acesso ao Conteúdo Exclusivo",
            reference: reference,
            productHash: PRODUCT_HASH, // Campo obrigatório
            customer: {
                name: bodyData.customer?.name || "Cliente Teste",
                email: bodyData.customer?.email || randomEmail,
                document: bodyData.customer?.document || "12345678909",
                phone: bodyData.customer?.phone || "11999999999"
            }
        };

        // Adicionar tracking UTM se existir
        if (tracking && Object.keys(tracking).length > 0) {
            payload.tracking = tracking;
        }

        // Requisição para a Paradise usando o header X-API-Key correto
        const response = await fetch(PARADISEPAGS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': TOKEN // Correção fundamental de autenticação
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: "A API da Paradise retornou HTML (Status " + response.status + "): " + responseText.substring(0, 200) 
                })
            };
        }

        if (!response.ok || data.status !== 'success') {
            return {
                statusCode: response.status || 400,
                body: JSON.stringify({ error: data.message || data.error || 'Erro ao processar pagamento na Paradise' })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno ao processar o pagamento: ' + error.message })
        };
    }
};
