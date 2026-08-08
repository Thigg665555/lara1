exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const bodyData = JSON.parse(event.body || '{}');
        const preco = bodyData.preco || 14.90;
        
        // 1. Pega o e-mail enviado pelo modal (ou do objeto customer se houver)
        const userEmail = bodyData.email || bodyData.customer?.email;
        
        // 2. Captura as UTMs enviadas pelo frontend
        const rawTracking = bodyData.utms || bodyData.tracking || {};

        // Configurações da API Paradise
        const PARADISEPAGS_API_URL = "https://multi.paradisepags.com/api/v1/transaction.php"; 
        const TOKEN = "sk_e2534c5d49d754f6dab7036bc14c3fabea6ed027f40c4d7f17a3c9ab3131137f"; 
        const PRODUCT_HASH = "prod_0d044a7710f1c8a0"; 

        // Gerar referência única obrigatória
        const reference = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        // E-mail aleatório de reserva (caso o lead não digite nada)
        const randomEmail = `cliente_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@mail.com`;

        // Organiza a estrutura de UTMs para a Paradise repassar para a Utmfy
        const trackingData = {
            utm_source: rawTracking.utm_source || bodyData.src || '',
            utm_medium: rawTracking.utm_medium || '',
            utm_campaign: rawTracking.utm_campaign || '',
            utm_content: rawTracking.utm_content || '',
            utm_term: rawTracking.utm_term || '',
            src: rawTracking.src || bodyData.src || ''
        };

        const payload = {
            amount: Math.round(preco * 100), // Valor em centavos
            description: "Acesso ao Conteúdo Exclusivo",
            reference: reference,
            productHash: PRODUCT_HASH,
            customer: {
                name: bodyData.customer?.name || "Cliente Teste",
                email: userEmail || randomEmail, // Usa o e-mail real capturado do lead
                document: bodyData.customer?.document || "12345678909",
                phone: bodyData.customer?.phone || "11999999999"
            },
            tracking: trackingData // Envia as UTMs integradas
        };

        // Requisição para a Paradise
        const response = await fetch(PARADISEPAGS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': TOKEN
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
