const formatter = new Intl.NumberFormat('el-gr', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

export default formatter;
