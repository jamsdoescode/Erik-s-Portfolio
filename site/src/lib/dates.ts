export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateString(): string {
  return toDateString(new Date());
}

export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split("T")[0].split("-").map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day, 12, 0, 0);
  }
  return new Date(date);
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split("T")[0].split("-").map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
