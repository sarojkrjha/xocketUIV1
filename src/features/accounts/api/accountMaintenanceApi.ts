import {
  ApiPath,
  type AssignContactToAccountCommand,
  type CreateTaskCommand,
  type CreateTimelineEventCommand,
  type RebuildAccountSearchIndexCommand,
  type UpdateAccountBankruptcyCommand,
  type UpdateAccountCommand
} from '@/shared/api/contracts/openapi.generated';
import { apiDelete, apiPost, apiPut, buildPath } from '@/shared/api/request';

export async function updateAccount(accountId: number, command: UpdateAccountCommand) {
  return apiPut<unknown, UpdateAccountCommand>(buildPath(ApiPath.apiV1AccountsAccountId, { accountId }), command);
}

export async function rebuildAccountSearchIndex(command: RebuildAccountSearchIndexCommand) {
  return apiPost<unknown, RebuildAccountSearchIndexCommand>(ApiPath.apiV1AccountsSearchIndexRebuild, command);
}

export async function assignContactToAccount(accountId: number, command: AssignContactToAccountCommand) {
  return apiPut<unknown, AssignContactToAccountCommand>(buildPath(ApiPath.apiV1AccountsAccountIdContacts, { accountId }), command);
}

export async function removeContactFromAccount(accountId: number, contactId: number) {
  return apiDelete<unknown>(buildPath(ApiPath.apiV1AccountsAccountIdContactsContactId, { accountId, contactId }));
}

export async function updateAccountBankruptcy(accountId: number, command: UpdateAccountBankruptcyCommand) {
  return apiPut<unknown, UpdateAccountBankruptcyCommand>(buildPath(ApiPath.apiV1AccountsAccountIdBankruptcy, { accountId }), command);
}

export async function createAccountTimelineEvent(command: CreateTimelineEventCommand) {
  return apiPost<unknown, CreateTimelineEventCommand>(ApiPath.apiV1Timeline, command);
}

export async function createAccountTask(command: CreateTaskCommand) {
  return apiPost<unknown, CreateTaskCommand>(ApiPath.apiV1Tasks, command);
}

export async function completeTask(taskId: number, completedByUserId: string) {
  return apiPut<unknown>(buildPath(ApiPath.apiV1TasksTaskIdComplete, { taskId }), { taskId, completedByUserId });
}

export async function cancelTask(taskId: number) {
  return apiPut<unknown>(buildPath(ApiPath.apiV1TasksTaskIdCancel, { taskId }));
}
