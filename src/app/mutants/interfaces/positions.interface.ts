export interface Position {
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'diagonal-inverse';
}
