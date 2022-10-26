import { CollectionDto, InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { CollectionItemView } from './types';

export const reduceInstructions = (
  item: CollectionItemView | null,
  instruction: InstructionStatus
): CollectionItemView | null => {
  switch (instruction.name) {
    case 'createCollection': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: CollectionDto;
        };
        const name = data.arguments.name;

        const workspaceId = instruction.accounts.find(
          (account) => account.name === 'Workspace'
        )?.pubkey;
        const applicationId = instruction.accounts.find(
          (account) => account.name === 'Application'
        )?.pubkey;
        const instructionId = instruction.accounts.find(
          (account) => account.name === 'Collection'
        )?.pubkey;

        if (
          workspaceId === undefined ||
          applicationId === undefined ||
          instructionId === undefined
        ) {
          throw new Error('Malformed Create Collection');
        }

        return {
          id: instructionId,
          name,
          isCreating: true,
          isUpdating: false,
          isDeleting: false,
          applicationId,
          workspaceId,
        };
      } else if (instruction.transactionStatus.status === 'finalized') {
        if (item === null) {
          return null;
        } else {
          return {
            ...item,
            isCreating: false,
          };
        }
      } else {
        return item;
      }
    }
    case 'updateCollection': {
      if (item === null) {
        return item;
      } else if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: CollectionDto;
        };
        const name = data.arguments.name;

        return {
          ...item,
          name,
          isUpdating: true,
        };
      } else if (instruction.transactionStatus.status === 'finalized') {
        return {
          ...item,
          isUpdating: false,
        };
      } else {
        return item;
      }
    }
    case 'deleteCollection':
      if (item === null) {
        return item;
      } else if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        return {
          ...item,
          isDeleting: true,
        };
      } else if (instruction.transactionStatus.status === 'finalized') {
        return null;
      } else {
        return item;
      }
    default:
      return item;
  }
};
