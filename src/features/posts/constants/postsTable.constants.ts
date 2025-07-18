import { CustomHeadCell } from '../types/table.types';

export const headCells: ReadonlyArray<CustomHeadCell> = [
  {
    id: 'select',
    label: '',
    numeric: false,
    sortable: false,
    minWidth: 40,
    maxWidth: 50,
    align: 'center',
    disablePadding: true,
  },
  {
    id: 'id',
    label: 'ID',
    numeric: false,
    sortable: true,
    minWidth: 60,
    maxWidth: 80,
  },
  {
    id: 'title',
    label: 'Title',
    numeric: false,
    sortable: true,
    minWidth: 250,
    cellMaxWidth: '400px',
    truncate: true,
  },
  {
    id: 'user',
    label: 'Author',
    numeric: false,
    sortable: true,
    minWidth: 180,
    cellMaxWidth: '250px',
    truncate: true,
  },
  {
    id: 'categories',
    label: 'Categories',
    numeric: false,
    sortable: false,
    minWidth: 200,
    align: 'center',
  },
  {
    id: 'createdAt',
    label: 'Created At',
    numeric: false,
    sortable: true,
    minWidth: 160,
  },
  {
    id: 'actions',
    label: 'Actions',
    numeric: false,
    sortable: false,
    minWidth: 80,
    maxWidth: 100,
    align: 'center',
  },
];
