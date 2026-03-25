'use client';

import { useState } from 'react';

export function useLogoutDialog() {
  const [open, setOpen] = useState(false);

  const openLogoutDialog = () => {
    setOpen(true);
  };

  const closeLogoutDialog = () => {
    setOpen(false);
  };

  return {
    open,
    setOpen,
    openLogoutDialog,
    closeLogoutDialog,
  };
}
