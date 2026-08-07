exports.handler = async function(event, context) {
    // Garante que a requisição é do tipo POST (que é como a ParadisePags envia os webhooks)
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        // 1. Pega os dados enviados pela ParadisePags no corpo da requisição
        const notification = JSON.parse(event.body || '{}');

        // 2. Exibe os dados no console do Netlify (Logs) para você acompanhar e auditar
        console.log("Webhook recebido com sucesso:", JSON.stringify(notification));

        // Aqui você pode extrair informações importantes, por exemplo:
        const statusPagamento = notification.status; // Ex: 'paid'
        const idTransacao = notification.id || notification.transaction_id;

        // Se o pagamento foi aprovado, você pode tomar ações aqui 
        if (statusPagamento === 'paid') {
            console.log(`Pagamento aprovado para a transação: ${idTransacao}`);
            // Exemplo: Se futuramente quiser integrar com banco de dados ou disparar automações, faria aqui.
        }

        // 3. Responde para a ParadisePags que o webhook foi recebido com sucesso
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Webhook processado com sucesso' })
        };

    } catch (error) {
        console.error("Erro ao processar o webhook:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro ao processar webhook' })
        };
    }
};