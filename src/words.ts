const plurals = new Intl.PluralRules("ru");

export function countLabel(
  count: number,
  forms: { one: string; few: string; many: string },
): string {
  const category = plurals.select(count);
  return `${count} ${forms[category === "one" || category === "few" ? category : "many"]}`;
}
