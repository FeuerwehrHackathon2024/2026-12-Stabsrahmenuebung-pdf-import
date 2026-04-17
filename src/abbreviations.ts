import db from "../abbreviations.json";

//db format: Record<string, string[]>

export function expandAbbreviations(unitName: string): string {
  for (const [abbreviation, expansions] of Object.entries(db)) {
    if (unitName.includes(abbreviation)) {
      for (const expansion of expansions) {
        const expandedUnitName = unitName.replace(abbreviation, expansion);
        if (expandedUnitName !== unitName) {
          return expandedUnitName;
        }
      }
    }
  }
  return unitName; // Return original if no abbreviation found
}

export function expandAbbreviationsInFreeformText(text: string): string {
  let expandedText = text;
  for (const [abbreviation, expansions] of Object.entries(db)) {
    for (const expansion of expansions) {
      expandedText = expandedText.replaceAll(expansion, abbreviation);
    }
  }
  return expandedText;
}
