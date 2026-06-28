import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import type {
  CreateClientCommand,
  CreatePortfolioCommand,
  CreateUserCommand,
  CreateWorkflowQueueCommand,
  UpsertSystemSettingCommand
} from '@/shared/api/contracts/openapi.generated';
import { normalizePagedResult } from '@/shared/api/pagination';
import { apiGet, apiPost, apiPut, buildPath } from '@/shared/api/request';
import type {
  AdminClient,
  AdminMutationResult,
  AdminPortfolio,
  AdminSearchRequest,
  PagedResult,
  PortfolioSearchRequest,
  SecurityPermission,
  SecurityRole,
  SecurityUser,
  SystemSetting,
  WorkflowQueue,
  WorkflowQueueSearchRequest
} from '../types/administration';

export async function getAdminClients(request: AdminSearchRequest): Promise<PagedResult<AdminClient>> {
  const data = await apiGet<unknown>(ApiPath.apiV1AdminClients, request);
  return normalizePagedResult(data, request, normalizeClient);
}

export async function createAdminClient(command: CreateClientCommand): Promise<AdminMutationResult> {
  return normalizeMutationResult(await apiPost<unknown, CreateClientCommand>(ApiPath.apiV1AdminClients, command));
}

export async function getAdminPortfolios(request: PortfolioSearchRequest): Promise<PagedResult<AdminPortfolio>> {
  const data = await apiGet<unknown>(ApiPath.apiV1AdminPortfolios, request);
  return normalizePagedResult(data, request, normalizePortfolio);
}

export async function createAdminPortfolio(command: CreatePortfolioCommand): Promise<AdminMutationResult> {
  return normalizeMutationResult(await apiPost<unknown, CreatePortfolioCommand>(ApiPath.apiV1AdminPortfolios, command));
}

export async function getSystemSettings(request: AdminSearchRequest): Promise<PagedResult<SystemSetting>> {
  const data = await apiGet<unknown>(ApiPath.apiV1AdminSystemSettings, request);
  return normalizePagedResult(data, request, normalizeSystemSetting);
}

export async function upsertSystemSetting(command: UpsertSystemSettingCommand): Promise<AdminMutationResult> {
  return normalizeMutationResult(await apiPut<unknown, UpsertSystemSettingCommand>(ApiPath.apiV1AdminSystemSettings, command));
}

export async function getWorkflowQueues(request: WorkflowQueueSearchRequest): Promise<PagedResult<WorkflowQueue>> {
  const data = await apiGet<unknown>(ApiPath.apiV1AdminWorkflowQueues, request);
  return normalizePagedResult(data, request, normalizeWorkflowQueue);
}

export async function createWorkflowQueue(command: CreateWorkflowQueueCommand): Promise<AdminMutationResult> {
  return normalizeMutationResult(await apiPost<unknown, CreateWorkflowQueueCommand>(ApiPath.apiV1AdminWorkflowQueues, command));
}

export async function getSecurityRoles(request: AdminSearchRequest): Promise<PagedResult<SecurityRole>> {
  const data = await apiGet<unknown>(ApiPath.apiV1SecurityRoles, request);
  return normalizePagedResult(data, request, normalizeRole);
}

export async function getSecurityPermissions(request: AdminSearchRequest): Promise<PagedResult<SecurityPermission>> {
  const data = await apiGet<unknown>(ApiPath.apiV1SecurityPermissions, request);
  return normalizePagedResult(data, request, normalizePermission);
}

export async function getSecurityUsers(request: AdminSearchRequest): Promise<PagedResult<SecurityUser>> {
  const data = await apiGet<unknown>(ApiPath.apiV1SecurityUsers, request);
  return normalizePagedResult(data, request, normalizeUser);
}

export async function createSecurityUser(command: CreateUserCommand): Promise<AdminMutationResult> {
  return normalizeMutationResult(await apiPost<unknown, CreateUserCommand>(ApiPath.apiV1SecurityUsers, command));
}

export async function assignRoleToUser(userId: number, roleId: number): Promise<AdminMutationResult> {
  const path = buildPath(ApiPath.apiV1SecurityUsersUserIdRolesRoleId, { userId, roleId });
  return normalizeMutationResult(await apiPost<unknown>(path));
}

export async function assignClientToUser(userId: number, clientId: number): Promise<AdminMutationResult> {
  const path = buildPath(ApiPath.apiV1SecurityUsersUserIdClientsClientId, { userId, clientId });
  return normalizeMutationResult(await apiPost<unknown>(path));
}

function normalizeClient(source: Record<string, unknown>): AdminClient {
  const id = numberValue(source.clientId ?? source.id);
  return {
    id,
    clientId: id,
    code: stringOrNull(source.code ?? source.clientCode),
    name: stringOrNull(source.name ?? source.clientName),
    isActive: boolOrNull(source.isActive),
    createdUtc: stringOrNull(source.createdUtc ?? source.createdOnUtc),
    modifiedUtc: stringOrNull(source.modifiedUtc ?? source.updatedUtc)
  };
}

function normalizePortfolio(source: Record<string, unknown>): AdminPortfolio {
  const id = numberValue(source.portfolioId ?? source.id);
  return {
    id,
    portfolioId: id,
    clientId: numberOrNull(source.clientId),
    clientName: stringOrNull(source.clientName),
    portfolioNumber: stringOrNull(source.portfolioNumber ?? source.number),
    portfolioName: stringOrNull(source.portfolioName ?? source.name),
    portfolioType: numberOrNull(source.portfolioType ?? source.type),
    portfolioTypeName: stringOrNull(source.portfolioTypeName ?? source.typeName),
    isActive: boolOrNull(source.isActive)
  };
}

function normalizeSystemSetting(source: Record<string, unknown>): SystemSetting {
  return {
    id: numberValue(source.id ?? source.settingId),
    key: stringOrNull(source.key ?? source.settingKey),
    value: stringOrNull(source.value ?? source.settingValue),
    description: stringOrNull(source.description),
    isEncrypted: boolOrNull(source.isEncrypted),
    updatedUtc: stringOrNull(source.updatedUtc ?? source.modifiedUtc)
  };
}

function normalizeWorkflowQueue(source: Record<string, unknown>): WorkflowQueue {
  const id = numberValue(source.workflowQueueId ?? source.id);
  return {
    id,
    workflowQueueId: id,
    code: stringOrNull(source.code),
    name: stringOrNull(source.name),
    module: stringOrNull(source.module),
    description: stringOrNull(source.description),
    isActive: boolOrNull(source.isActive)
  };
}

function normalizeRole(source: Record<string, unknown>): SecurityRole {
  const id = numberValue(source.roleId ?? source.id);
  return {
    id,
    roleId: id,
    code: stringOrNull(source.code ?? source.roleCode),
    name: stringOrNull(source.name ?? source.roleName),
    description: stringOrNull(source.description),
    isActive: boolOrNull(source.isActive)
  };
}

function normalizePermission(source: Record<string, unknown>): SecurityPermission {
  const id = numberValue(source.permissionId ?? source.id);
  return {
    id,
    permissionId: id,
    code: stringOrNull(source.code ?? source.permissionCode),
    name: stringOrNull(source.name ?? source.permissionName),
    module: stringOrNull(source.module),
    description: stringOrNull(source.description)
  };
}

function normalizeUser(source: Record<string, unknown>): SecurityUser {
  const id = numberValue(source.userId ?? source.id);
  return {
    id,
    userId: id,
    externalIdentityId: stringOrNull(source.externalIdentityId ?? source.externalId),
    email: stringOrNull(source.email),
    displayName: stringOrNull(source.displayName ?? source.name),
    isActive: boolOrNull(source.isActive),
    lastLoginUtc: stringOrNull(source.lastLoginUtc ?? source.lastSeenUtc)
  };
}

function normalizeMutationResult(value: unknown): AdminMutationResult {
  const source = objectOrEmpty(value);
  return {
    id: numberOrUndefined(source.id ?? source.clientId ?? source.portfolioId ?? source.userId ?? source.workflowQueueId),
    success: source.success === undefined ? true : Boolean(source.success),
    message: stringOrNull(source.message ?? source.detail)
  };
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const result = String(value).trim();
  return result.length > 0 ? result : null;
}

function numberValue(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function numberOrUndefined(value: unknown): number | undefined {
  const parsed = numberOrNull(value);
  return parsed ?? undefined;
}

function boolOrNull(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const normalized = String(value).toLowerCase();
  if (['true', 'yes', 'active', '1'].includes(normalized)) return true;
  if (['false', 'no', 'inactive', '0'].includes(normalized)) return false;
  return null;
}
