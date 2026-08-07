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

        const PARADISEPAGS_API_URL = "https://multi.paradisepags.com/api/v1/transaction.php"; 
        const TOKEN = "sk_e2534c5d49d754f6dab7036bc14c3fabea6ed027f40c4d7f17a3c9ab3131137f"; 
        const PRODUCT_HASH = "prod_0d044a7710f1c8a0"; 

        const payload = {
            amount: Math.round(preco * 100),
            product_hash: PRODUCT_HASH,
            customer: {
                name: "Cliente Teste",
                email: "cliente_" + Math.floor(Math.random() * 100000) + "@gmail.com",
                tax_id: "12345678909"
            }
        };

        const response = await fetch(PARADISEPAGS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
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

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erro interno ao processar o pagamento: " + error.message })
        };
    }
};
