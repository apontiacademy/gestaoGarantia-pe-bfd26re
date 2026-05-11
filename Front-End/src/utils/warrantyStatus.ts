// CONVERTE DATA BRASILEIRA
function parseBrazilianDate(dateString: string): Date {
    const [day, month, year] = dateString.split("/");

    return new Date(Number(year), Number(month) - 1, Number(day));
}

// CALCULA STATUS DA GARANTIA
export function calculateWarrantyStatus(expirationDate?: string) {
    if (!expirationDate) {
        return {
            status: "Ativo",
            daysToExpire: null,
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiration = parseBrazilianDate(expirationDate);
    expiration.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
        (expiration.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // VENCIDA
    if (diffDays < 0) {
        return {
            status: "Vencida",
            daysToExpire: null,
        };
    }

    // A VENCER
    if (diffDays <= 15) {
        return {
            status: "A vencer",
            daysToExpire: diffDays,
        };
    }

    // ATIVA
    return {
        status: "Ativo",
        daysToExpire: diffDays,
    };
}