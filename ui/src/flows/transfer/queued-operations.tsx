import React, { useState } from 'react';

import { QueueEntry, Op } from '~/types';
import { useUnraidActions } from '~/state/unraid';
import { humanBytes } from '~/helpers/units';
import { Button } from '~/shared/buttons/button';
import { Icon } from '~/shared/icons/icon';

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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allExpanded = items.length > 0 && items.every((item) => expanded.has(item.id));

  const handleExpandCollapse = () => {
    if (allExpanded) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(items.map((item) => item.id)));
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Queued ({items.length})
        </h3>
        <Button
          label={allExpanded ? 'Collapse All' : 'Expand All'}
          variant="secondary"
          onClick={handleExpandCollapse}
        />
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="bg-neutral-100 dark:bg-gray-800 rounded">
            <div
              className="flex items-center justify-between px-4 py-2 cursor-pointer"
              onClick={() => toggle(item.id)}
            >
              <div className="flex items-center gap-2">
                <Icon name={expanded.has(item.id) ? 'minus' : 'plus'} size={16} />
                <span className="text-sm font-medium">{opLabel(item.opKind)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {humanBytes(item.bytesToTransfer)}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={() => removeFromQueue(item.id)}
                  />
                </div>
              </div>
            </div>
            {expanded.has(item.id) && (
              <div className="px-4 pb-3 pt-1 border-t border-neutral-200 dark:border-gray-700">
                {item.items && item.items.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {item.items.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-mono">{file.path}</span>
                        <span className="text-muted-foreground ml-4 shrink-0">
                          {humanBytes(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No detail available</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
