exports.handler = async function(event, context) {
    const hash = event.queryStringParameters.hash;

    if (!hash) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Hash não fornecido' }) };
    }

    try {
        const TOKEN = "sk_e2534c5d49d754f6dab7036bc14c3fabea6ed027f40c4d7f17a3c9ab3131137f"; // Seu token da ParadisePags

        const response = await fetch(`https://api.paradisepags.com/v1/transaction/${hash}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        const data = await response.json();

        // Verifique o status retornado pela API da ParadisePags e ajuste a condição se necessário
        const pago = data.status === 'paid' || data.status === 'approved';

        return {
            statusCode: 200,
            body: JSON.stringify({
                status: pago ? 'paid' : 'pending',
                redirect_url: 'tarifa/obrigado-lp.php' // Para onde vai quando pagar
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};