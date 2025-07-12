import { DisplayUser, HeadCell } from '../types';

export const defaultHeadCells: ReadonlyArray<
  HeadCell<DisplayUser> & {
    truncate?: boolean;
    wrap?: boolean;
    cellMaxWidth?: string;
  }
> = [
  {
    id: 'avatar',
    label: 'Avatar',
    numeric: false,
    sortable: false,
    disablePadding: true,
    minWidth: 60,
    align: 'center',
  },
  {
    id: 'username',
    label: 'Username',
    numeric: false,
    sortable: true,
    truncate: true,
    minWidth: 160,
    cellMaxWidth: '160px',
  },
  {
    id: 'email',
    label: 'Email',
    numeric: false,
    sortable: true,
    minWidth: 200,
    truncate: true,
    cellMaxWidth: '200px',
  },
  {
    id: 'fullName',
    label: 'Full Name',
    numeric: false,
    sortable: true,
    minWidth: 160,
  },
  {
    id: 'roles',
    label: 'Roles',
    numeric: false,
    sortable: false,
    minWidth: 120,
    align: 'center',
  },
  {
    id: 'status',
    label: 'Status',
    numeric: false,
    sortable: false,
    minWidth: 120,
    align: 'center',
  },
  {
    id: 'currentPlan',
    label: 'Current Plan',
    numeric: false,
    sortable: false,
    minWidth: 150,
    isDate: true,
    align: 'center',
  },
  {
    id: 'actions',
    label: 'Actions',
    numeric: false,
    sortable: false,
    minWidth: 80,
    align: 'center',
  },
];
