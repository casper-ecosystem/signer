import React from 'react';
import { SigningDataRow } from '../../../shared';
import { Tooltip, withStyles } from '@material-ui/core';
import { TooltipStyles } from '.';

interface TooltippedListItemProps {
  data: SigningDataRow;
  classes: Record<keyof ReturnType<typeof TooltipStyles>, string>;
}

const TooltippedListItem = (props: TooltippedListItemProps) => {
  return (
    <Tooltip
      title={props.data.tooltipContent}
      placement="top"
      classes={{ tooltip: props.classes.listItemTooltip }}
    >
      <li>{props.data.value}</li>
    </Tooltip>
  );
};

export default withStyles(TooltipStyles)(TooltippedListItem);
