import type {
  CreateClientCommand,
  CreatePortfolioCommand,
  CreateUserCommand,
  CreateWorkflowQueueCommand,
  UpsertSystemSettingCommand
} from '@/shared/api/contracts/openapi.generated';

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type AdminSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
};

export type PortfolioSearchRequest = AdminSearchRequest & {
  clientId?: number;
};

export type WorkflowQueueSearchRequest = AdminSearchRequest & {
  module?: string;
};

export type AdminClient = {
  id: number;
  clientId: number;
  code: string | null;
  name: string | null;
  isActive: boolean | null;
  createdUtc: string | null;
  modifiedUtc: string | null;
};

export type AdminPortfolio = {
  id: number;
  portfolioId: number;
  clientId: number | null;
  clientName: string | null;
  portfolioNumber: string | null;
  portfolioName: string | null;
  portfolioType: number | null;
  portfolioTypeName: string | null;
  isActive: boolean | null;
};

export type SystemSetting = {
  id: number;
  key: string | null;
  value: string | null;
  description: string | null;
  isEncrypted: boolean | null;
  updatedUtc: string | null;
};

export type WorkflowQueue = {
  id: number;
  workflowQueueId: number;
  code: string | null;
  name: string | null;
  module: string | null;
  description: string | null;
  isActive: boolean | null;
};

export type SecurityRole = {
  id: number;
  roleId: number;
  code: string | null;
  name: string | null;
  description: string | null;
  isActive: boolean | null;
};

export type SecurityPermission = {
  id: number;
  permissionId: number;
  code: string | null;
  name: string | null;
  module: string | null;
  description: string | null;
};

export type SecurityUser = {
  id: number;
  userId: number;
  externalIdentityId: string | null;
  email: string | null;
  displayName: string | null;
  isActive: boolean | null;
  lastLoginUtc: string | null;
};

export type AdminMutationResult = {
  id?: number;
  success?: boolean;
  message?: string | null;
};

export type ClientForm = Required<Pick<CreateClientCommand, 'code' | 'name'>>;
export type PortfolioForm = Required<Pick<CreatePortfolioCommand, 'clientId' | 'portfolioNumber' | 'portfolioName' | 'portfolioType'>>;
export type WorkflowQueueForm = Required<Pick<CreateWorkflowQueueCommand, 'code' | 'name' | 'module'>> & Pick<CreateWorkflowQueueCommand, 'description'>;
export type SystemSettingForm = Required<Pick<UpsertSystemSettingCommand, 'key' | 'value'>> & Pick<UpsertSystemSettingCommand, 'description'>;
export type UserForm = Required<Pick<CreateUserCommand, 'externalIdentityId' | 'email' | 'displayName'>>;

export type AssignmentForm = {
  userId: string;
  roleId: string;
  clientId: string;
};
