import { useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import React from 'react';

export const LinkButton = (props: { title: string; path: string }) => {
  let history = useHistory();

  function handleClick() {
    history.push(props.path);
  }

  return <Button onClick={handleClick}>{props.title}</Button>;
};

export const ListInline = (props: { children: any }) => {
  const children = [].concat(props.children);
  return (
    <ul className="list-inline mb-0">
      {children.map((child: any, idx: number) => (
        <li key={idx} className="list-inline-item">
          {child}
        </li>
      ))}
    </ul>
  );
};

export const IconButton = (props: {
  onClick: () => void;
  title: string;
  icon: string;
}) => (
  <button
    onClick={_ => props.onClick()}
    title={props.title}
    className="link icon-button"
  >
    <Icon name={props.icon} />
  </button>
);

// https://fontawesome.com/icons?d=gallery&q=ground&m=free
export const Icon = (props: {
  name: string;
  color?: string;
  fontSize?: number;
  title?: string;
}) => {
  const styles = {
    color: props.color,
    fontSize: props.fontSize
  };
  return (
    <i
      className={'fa fa-fw fa-' + props.name}
      style={styles}
      title={props.title}
    />
  );
};
