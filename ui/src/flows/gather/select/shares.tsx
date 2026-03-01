import React from 'react';

import { Panel } from '~/shared/panel/panel';
import { CheckboxTree } from '~/shared/tree/checkbox-tree';
import { Node, Nodes } from '~/types';
import { Icon } from '~/shared/icons/icon';
import {
  useGatherActions,
  useGatherTree,
  useGatherLocation,
  useGatherHideGrouped,
} from '~/state/gather';

export const Shares: React.FunctionComponent = () => {
  const tree = useGatherTree();
  const location = useGatherLocation();
  const hideGrouped = useGatherHideGrouped();
  const { loadShares, loadBranch, toggleSelected } = useGatherActions();

  React.useEffect(() => {
    loadShares();
  }, [loadShares]);

  const onLoad = async (node: Node) => await loadBranch(node);
  const onCheck = (node: Node) => toggleSelected(node);

  const filteredTree = React.useMemo<Nodes>(() => {
    if (!hideGrouped) return tree;
    const result: Nodes = { ...tree };
    for (const id of Object.keys(result)) {
      if (result[id]?.children?.length) {
        result[id] = {
          ...result[id],
          children: result[id].children.filter(
            (childId) => location[childId]?.length !== 1,
          ),
        };
      }
    }
    return result;
  }, [tree, location, hideGrouped]);

  return (
    <Panel title="Shares">
      <CheckboxTree
        nodes={filteredTree}
        onLoad={onLoad}
        onCheck={onCheck}
        icons={{
          collapseIcon: (
            <Icon
              name="minus"
              size={20}
              style="fill-slate-500 dark:fill-gray-700"
            />
          ),
          expandIcon: (
            <Icon
              name="plus"
              size={20}
              style="fill-slate-500 dark:fill-gray-700"
            />
          ),
          checkedIcon: (
            <Icon
              name="checked"
              size={20}
              style="fill-green-700 dark:fill-lime-600"
            />
          ),
          uncheckedIcon: (
            <Icon
              name="unchecked"
              size={20}
              style="fill-slate-700 dark:fill-slate-200"
            />
          ),
          leafIcon: (
            <Icon
              name="file"
              size={20}
              style="fill-blue-400 dark:fill-gray-700"
            />
          ),
          parentIcon: (
            <Icon
              name="folder"
              size={20}
              style="fill-orange-400 dark:fill-gray-700"
            />
          ),
          hiddenIcon: (
            <Icon
              name="square"
              size={20}
              style="fill-neutral-200 dark:fill-gray-950"
            />
          ),
          loadingIcon: (
            <Icon
              name="loading"
              size={20}
              style="animate-spin fill-slate-700 dark:fill-slate-700"
            />
          ),
        }}
      />
    </Panel>
  );
};
