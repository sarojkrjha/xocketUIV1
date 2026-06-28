import {
  ApiPath,
  type UpdateContactCommand,
  type UpsertContactAddressCommand,
  type UpsertContactEmailCommand,
  type UpsertContactIdentifierCommand,
  type UpsertContactPhoneCommand
} from '@/shared/api/contracts/openapi.generated';
import { apiPut, buildPath } from '@/shared/api/request';

export async function updateContact(contactId: number, command: UpdateContactCommand) {
  return apiPut<unknown, UpdateContactCommand>(buildPath(ApiPath.apiV1AccountsContactsContactId, { contactId }), command);
}

export async function upsertContactAddress(contactId: number, command: UpsertContactAddressCommand) {
  return apiPut<unknown, UpsertContactAddressCommand>(buildPath(ApiPath.apiV1AccountsContactsContactIdAddress, { contactId }), command);
}

export async function upsertContactPhone(contactId: number, command: UpsertContactPhoneCommand) {
  return apiPut<unknown, UpsertContactPhoneCommand>(buildPath(ApiPath.apiV1AccountsContactsContactIdPhone, { contactId }), command);
}

export async function upsertContactEmail(contactId: number, command: UpsertContactEmailCommand) {
  return apiPut<unknown, UpsertContactEmailCommand>(buildPath(ApiPath.apiV1AccountsContactsContactIdEmail, { contactId }), command);
}

export async function upsertContactIdentifier(contactId: number, command: UpsertContactIdentifierCommand) {
  return apiPut<unknown, UpsertContactIdentifierCommand>(buildPath(ApiPath.apiV1AccountsContactsContactIdIdentifier, { contactId }), command);
}
