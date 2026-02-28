import React from 'react';

import { QueueEntry, Op } from '~/types';
import { useUnraidActions } from '~/state/unraid';
import { humanBytes } from '~/helpers/units';
import { Button } from '~/shared/buttons/button';

const opLabel = (opKind: number): string => {
  switch (opKind) {
    case Op.ScatterMove:
      return 'Scatter Move';
    case Op.ScatterCopy:
      return 'Scatter Copy';
    case Op.GatherMove:
      return 'Gather Move';
    default:
      return 'Replay';
  }
};

interface Props {
  items: QueueEntry[];
}

export const QueuedOperations: React.FunctionComponent<Props> = ({ items }) => {
  const { removeFromQueue } = useUnraidActions();

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Queued ({items.length})
      </h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-gray-800 rounded"
          >
            <span className="text-sm font-medium">{opLabel(item.opKind)}</span>
            <span className="text-sm text-muted-foreground">
              {humanBytes(item.bytesToTransfer)}
            </span>
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => removeFromQueue(item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
