import React from 'react';
import { Transfer } from '~/shared/transfer/transfer';
import { Actions } from '~/shared/transfer/actions';
import { useUnraidOperation, useUnraidQueue } from '~/state/unraid';
import { QueuedOperations } from './queued-operations';

export const TransferPage: React.FunctionComponent = () => {
  const operation = useUnraidOperation();
  const queue = useUnraidQueue();

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Actions />
        </div>
        {operation && <Transfer />}
        {queue.length > 0 && <QueuedOperations items={queue} />}
      </div>
    </div>
  );
};
