import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateContact, upsertContactAddress, upsertContactEmail, upsertContactIdentifier, upsertContactPhone } from '../api/contactMaintenanceApi';

export function useContactMaintenance(contactId: number) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['contacts', 'detail', contactId] }),
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    ]);
  };

  return {
    updateContact: useMutation({ mutationFn: (command: Parameters<typeof updateContact>[1]) => updateContact(contactId, command), onSuccess: invalidate }),
    upsertAddress: useMutation({ mutationFn: (command: Parameters<typeof upsertContactAddress>[1]) => upsertContactAddress(contactId, command), onSuccess: invalidate }),
    upsertPhone: useMutation({ mutationFn: (command: Parameters<typeof upsertContactPhone>[1]) => upsertContactPhone(contactId, command), onSuccess: invalidate }),
    upsertEmail: useMutation({ mutationFn: (command: Parameters<typeof upsertContactEmail>[1]) => upsertContactEmail(contactId, command), onSuccess: invalidate }),
    upsertIdentifier: useMutation({ mutationFn: (command: Parameters<typeof upsertContactIdentifier>[1]) => upsertContactIdentifier(contactId, command), onSuccess: invalidate })
  };
}
