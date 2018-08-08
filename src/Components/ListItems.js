import React from 'react';

const ListItems = ({ list, title }) => {

  const listElements = list.map((item) => <li key={item.name}>{item.name}: {item.count}</li>);

  return (
    <div>
      <h2>{title}</h2>
      <ol className="List-items">
        {listElements}
      </ol>
    </div>
  );
}

export default ListItems;
