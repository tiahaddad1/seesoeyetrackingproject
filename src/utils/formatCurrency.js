const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
    currency: 'GBP',
    style: 'currency',
});

const formatCurrency = number => CURRENCY_FORMATTER.format(number);

export default formatCurrency;
