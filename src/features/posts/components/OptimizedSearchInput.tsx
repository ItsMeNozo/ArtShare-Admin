import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

interface OptimizedSearchInputProps {
  value: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const OptimizedSearchInput: React.FC<OptimizedSearchInputProps> =
  React.memo(
    ({
      value,
      onSearchChange,
      placeholder = 'Search posts...',
      disabled = false,
    }) => {
      const theme = useTheme();
      const [localValue, setLocalValue] = useState(value);

      const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = event.target.value;
          setLocalValue(newValue);
          onSearchChange(newValue);
        },
        [onSearchChange],
      );

      return (
        <TextField
          size="small"
          variant="outlined"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          disabled={disabled}
          sx={{
            minWidth: { xs: '100%', sm: 200, md: 250 },
            maxWidth: { sm: 400 },
            backgroundColor:
              theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.9rem',
              '& fieldset': {
                borderColor:
                  theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
              },
              '&:hover fieldset': { borderColor: theme.palette.primary.main },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          autoComplete="off"
          spellCheck={false}
        />
      );
    },
  );

OptimizedSearchInput.displayName = 'OptimizedSearchInput';
