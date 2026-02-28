import React from 'react';
import { Transfer } from '~/shared/transfer/transfer';
import { Actions } from '~/shared/transfer/actions';
import { useUnraidOperation, useUnraidQueue } from '~/state/unraid';
import { QueuedOperations } from './queued-operations';

export const TransferPage: React.FunctionComponent = () => {
  const operation = useUnraidOperation();
  const queue = useUnraidQueue();

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
      {queue.length > 0 && <QueuedOperations items={queue} />}
    </div>
  );
};
