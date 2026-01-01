
export const getTodayKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00'); // Ensure local midnight parsing
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

export const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const getDaysInMonth = (monthIndex: number, year: number) => {
  if (monthIndex === 1 && isLeapYear(year)) return 29;
  const standardDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return standardDays[monthIndex];
};
