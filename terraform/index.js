function toNumber(value) {
	if (typeof value === 'number') {
		return value;
	}

	if (!value) {
		return 0;
	}

	if (typeof value === 'string') {
		const normalized = value
			.replace(/R\$/g, '')
			.replace(/\./g, '')
			.replace(',', '.')
			.trim();
		const parsed = Number(normalized);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
}

exports.handler = async () => {
	const baseUrl = process.env.API_URL;

	if (!baseUrl) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'API_URL não configurada na Lambda.' })
		};
	}

	try {
		const response = await fetch(`${baseUrl}/items`);

		if (!response.ok) {
			throw new Error(`Falha ao consultar /items: ${response.status}`);
		}

		const items = await response.json();
		const totalVehicles = items.length;
		const available = items.filter((v) => v.status === 'available').length;
		const sold = items.filter((v) => v.status === 'sold').length;
		const totalPrice = items.reduce((sum, v) => sum + toNumber(v.price), 0);
		const avgPrice = totalVehicles > 0 ? Number((totalPrice / totalVehicles).toFixed(2)) : 0;

		const byBrand = items.reduce((acc, v) => {
			const brand = v.brand || 'Sem marca';
			acc[brand] = (acc[brand] || 0) + 1;
			return acc;
		}, {});

		return {
			statusCode: 200,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				totalVehicles,
				available,
				sold,
				avgPrice,
				byBrand,
				generatedAt: new Date().toISOString()
			})
		};
	} catch (error) {
		return {
			statusCode: 502,
			body: JSON.stringify({
				error: 'Erro ao gerar relatório.',
				details: error.message
			})
		};
	}
};
