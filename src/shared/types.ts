type RowValue = string | string[];

export interface SigningDataRow {
  key: string;
  value: RowValue;
  tooltipContent: string;
}
