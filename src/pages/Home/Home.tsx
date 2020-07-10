import React, { useContext, useEffect, useState } from 'react';
import ApiContext from '../../contexts/ApiContext';

const Home = () => {
  const [msg, setMsg] = useState('');
  const { api } = useContext(ApiContext);

  useEffect(() => {
    api!.hello().then((r) => setMsg(`API says: ${r.msg}`));
  }, [api]);

  return (
    <>
      <h1>Home</h1>
      <h2>{msg}</h2>
    </>
  );
};

export default Home;
