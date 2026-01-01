
export const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

export const formatDateDisplay = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

export const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const getDaysInMonth = (monthIndex: number, year: number) => {
  if (monthIndex === 1 && isLeapYear(year)) return 29;
  const standardDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return standardDays[monthIndex];
};
