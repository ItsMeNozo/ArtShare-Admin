export type SortableFields = 'title' | 'user' | 'created_at';

export interface CustomHeadCell {
  id: SortableFields | 'id' | 'actions' | 'select';
  label: string;
  numeric: boolean;
  sortable: boolean;
  minWidth?: number | string;
  maxWidth?: number | string;
  cellMaxWidth?: string;
  align?: 'left' | 'right' | 'center';
  disablePadding?: boolean;
  truncate?: boolean;
  wrap?: boolean;
}
