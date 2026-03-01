import React from 'react';

import { useUnraidRoute } from '~/state/unraid';
import { useGatherActions, useGatherHideGrouped } from '~/state/gather';
import { Description as SelectDescription } from './select/description';
import { Description as PlanDescription } from './plan/description';
import { Description as TransferDescription } from './transfer/description';
import { Line } from '~/shared/transfer/line';

export const Ticker: React.FunctionComponent = () => {
  const route = useUnraidRoute();
  const hideGrouped = useGatherHideGrouped();
  const { toggleHideGrouped } = useGatherActions();

  return (
    <div>
      {(route === '/gather/select' || route === '/gather') && (
        <div className="flex items-center justify-between">
          <SelectDescription />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hide-grouped"
              checked={hideGrouped}
              onChange={toggleHideGrouped}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="hide-grouped" className="text-sm font-medium">
              Hide grouped
            </label>
          </div>
        </div>
      )}
      {route === '/gather/plan' && <PlanDescription />}
      {route === '/gather/transfer/targets' && <TransferDescription />}
      {route === '/gather/transfer/operation' && <Line />}
    </div>
  );
};
