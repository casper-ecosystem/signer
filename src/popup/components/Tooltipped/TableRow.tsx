import React from 'react';
import { Tooltip, TableRow, TableCell } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { SigningDataRow } from '../../../shared';
import { isCSPRValueByKey, parseRow } from '../../container/SigningContainer';
import { TooltipStyles, TooltippedListItem, BlankTooltipContent } from '.';

interface TooltippedTableRowProps {
  data: SigningDataRow;
  classes: Record<keyof ReturnType<typeof TooltipStyles>, string>;
}

const TooltippedTableRow = (props: TooltippedTableRowProps) => {
  // If the row displays Motes use the CSPR specific tooltip styling
  const isMotesValue = isCSPRValueByKey(props.data.key);

  return (
    <Tooltip
      title={props.data.tooltipContent}
      placement="top"
      classes={{
        tooltip: isMotesValue
          ? props.classes.csprToolTip
          : props.classes.tooltip
      }}
    >
      <TableRow>
        <TableCell style={{ fontWeight: 'bold' }}>{props.data.key}</TableCell>
        <TableCell align="right">
          {
            /**
             * Checks if the string represents a list so it can be displayed properly
             */
            Array.isArray(props.data.value) ? (
              <ul style={{ listStyleType: 'none' }}>
                {props.data.value.map((item: string) => {
                  const listItemData: SigningDataRow = {
                    key: props.data.key,
                    value: item,
                    tooltipContent: BlankTooltipContent
                  };
                  // Utilises the parseRow method to properly parse the inner value and then display it
                  return <TooltippedListItem data={parseRow(listItemData)} />;
                })}
              </ul>
            ) : (
              props.data.value
            )
          }
        </TableCell>
      </TableRow>
    </Tooltip>
  );
};

export default withStyles(TooltipStyles)(TooltippedTableRow);
