import React, { Component } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction
} from '@material-ui/core';
import RootRef from '@material-ui/core/RootRef';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AccountManager from '../container/AccountManager';
import * as nacl from 'tweetnacl-ts';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

interface Item {
  id: string;
  primary: string;
  secondary?: string;
}

// a little function to help us with reordering the result
const reorder = (list: Item[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: 'rgb(235,235,235)'
  })
});

interface Props {
  authContainer: AccountManager;
}

@observer
export class AccountManagementPage extends Component<Props, { items: Item[] }> {
  onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    this.props.authContainer.reorderAccount(
      result.source.index,
      result.destination.index
    );
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    console.log(this.props.authContainer.userAccounts.length);
    return (
      <DragDropContext onDragEnd={result => this.onDragEnd(result)}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <RootRef rootRef={provided.innerRef}>
              <List>
                {this.props.authContainer.userAccounts.map((item, index) => (
                  <Draggable
                    key={item.name}
                    draggableId={item.name}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <ListItem
                        innerRef={provided.innerRef}
                        ContainerProps={{
                          ...provided.draggableProps,
                          ...provided.dragHandleProps,
                          style: getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )
                        }}
                      >
                        <ListItemText primary={item.name} />
                        <ListItemSecondaryAction>
                          <IconButton edge={'end'} onClick={() => {}}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge={'end'}
                            onClick={() => {
                              const pkBase64 = nacl.encodeBase64(
                                item.signKeyPair.publicKey
                              );
                              this.props.authContainer.removeUserAccount(
                                pkBase64
                              );
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            </RootRef>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
