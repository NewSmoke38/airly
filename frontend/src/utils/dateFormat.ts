export const formatDateShort = (dateValue?: string): string => {
  if (!dateValue) return '';

  const normalizedDate = String(dateValue).trim();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const isoMatch = normalizedDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    const month = monthNames[monthIndex];

    if (month && day >= 1 && day <= 31) {
      return `${day} ${month}, ${year}`;
    }
  }

  const extendedYearMatch = normalizedDate.match(/^(\d{5,})[-/](\d{1,2})[-/](\d{1,2})/);
  if (extendedYearMatch) {
    const year = extendedYearMatch[1].slice(0, 4);
    const monthIndex = Number(extendedYearMatch[2]) - 1;
    const day = Number(extendedYearMatch[3]);
    const month = monthNames[monthIndex];

    if (month && day >= 1 && day <= 31) {
      return `${day} ${month}, ${year}`;
    }
  }

  const parsedDate = new Date(normalizedDate.slice(0, 10));
  if (Number.isNaN(parsedDate.getTime())) return '';

  const day = parsedDate.getDate();
  const month = monthNames[parsedDate.getMonth()];
  const year = String(parsedDate.getFullYear());
  return `${day} ${month}, ${year}`;
};
