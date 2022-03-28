import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { Amplify, DataStore, Predicates } from "aws-amplify";
import { Post, PostStatus } from "./models";

//Use next two lines only if syncing with the cloud
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

function App() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const onQuery = async () => {
    //const posts = await DataStore.query(Post, (c) => c.rating("gt", 4));
    const posts = await DataStore.query(Post);
    setItems(posts);
    console.log(posts);
  }

  const onCreate = async () => {
    await DataStore.save(
      new Post({
        title: `New title ${Date.now()}`,
        rating: (function getRandomInt(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min)) + min;
        })(1, 7),
        status: PostStatus.ACTIVE,
      })
    );

    await onQuery();
  }

  const onDeleteAll = async () => {
    await DataStore.delete(Post, Predicates.ALL);
    await onQuery();
  }

  const onDeleteOne = async () => {
    await DataStore.delete(items[0]);
    await onQuery();
  }

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await onQuery();
        const subscription = DataStore.observe(Post).subscribe((msg) => {
          console.log('Model: ',msg.model);
          console.log('opType: ', msg.opType);
          console.log('element: ', msg.element);
          onQuery();
        });
    
        return () => subscription.unsubscribe();
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const count = loading ? 'loading' : items.length;

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <input type="button" value="NEW" onClick={onCreate} />
          <input type="button" value="DELETE ONE" onClick={onDeleteOne} />
          <input type="button" value="DELETE ALL" onClick={onDeleteAll} />
        </div>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div>
          Number of items: { count }
        </div>

      </header>
    </div>
  );
}

export default App;