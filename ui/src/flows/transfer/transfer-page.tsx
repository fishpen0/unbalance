import React from 'react';
import { Transfer } from '~/shared/transfer/transfer';
import { Actions } from '~/shared/transfer/actions';
import { useUnraidOperation } from '~/state/unraid';

export const TransferPage: React.FunctionComponent = () => {
  const operation = useUnraidOperation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4">
        <Actions />
      </div>
      {operation ? (
        <Transfer />
      ) : (
        <p className="text-muted-foreground">No active transfer.</p>
      )}
    </div>
  );
};
