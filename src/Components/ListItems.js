import React from 'react';

const ListItems = ({ list, title }) => {

  const listElements = list.map(({ name, count }) => <li key={name}>{name}: {count}</li>);

  return (
    <div>
      <h3>{title}</h3>
      <ol className="List-items">
        {listElements}
      </ol>
    </div>
  );
}

export default ListItems;
