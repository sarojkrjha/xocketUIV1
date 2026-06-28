import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  assignContactToAccount,
  cancelTask,
  completeTask,
  createAccountTask,
  createAccountTimelineEvent,
  rebuildAccountSearchIndex,
  removeContactFromAccount,
  updateAccount,
  updateAccountBankruptcy
} from '../api/accountMaintenanceApi';

export function useAccountMaintenance(accountId: number) {
  const queryClient = useQueryClient();

  const invalidateAccount = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(accountId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.root })
    ]);
  };

  return {
    updateAccount: useMutation({ mutationFn: (command: Parameters<typeof updateAccount>[1]) => updateAccount(accountId, command), onSuccess: invalidateAccount }),
    rebuildIndex: useMutation({ mutationFn: rebuildAccountSearchIndex }),
    assignContact: useMutation({ mutationFn: (command: Parameters<typeof assignContactToAccount>[1]) => assignContactToAccount(accountId, command), onSuccess: invalidateAccount }),
    removeContact: useMutation({ mutationFn: (contactId: number) => removeContactFromAccount(accountId, contactId), onSuccess: invalidateAccount }),
    updateBankruptcy: useMutation({ mutationFn: (command: Parameters<typeof updateAccountBankruptcy>[1]) => updateAccountBankruptcy(accountId, command), onSuccess: invalidateAccount }),
    createTimelineEvent: useMutation({ mutationFn: createAccountTimelineEvent, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', 'timeline', accountId] }) }),
    createTask: useMutation({ mutationFn: createAccountTask, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', 'tasks', accountId] }) }),
    completeTask: useMutation({ mutationFn: ({ taskId, completedByUserId }: { taskId: number; completedByUserId: string }) => completeTask(taskId, completedByUserId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', 'tasks', accountId] }) }),
    cancelTask: useMutation({ mutationFn: cancelTask, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', 'tasks', accountId] }) })
  };
}
