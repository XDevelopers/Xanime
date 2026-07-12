interface GenerateSkuParams {
  brand: string;
  category: string;
  animeSeries: string;
  sizeValue: string;
  unitSymbol: string;
}

const getCode = (value: string): string => {
  return value
    .trim()
    .replace(/\s+/g, "")
    .substring(0, 3)
    .toUpperCase();
};

export const generateBaseSku = ({
  brand,
  category,
  animeSeries,
  sizeValue,
  unitSymbol,
}: GenerateSkuParams): string => {
  return `${getCode(brand)}-${getCode(category)}-${getCode(animeSeries)}-${sizeValue}${unitSymbol.toUpperCase()}`;
};