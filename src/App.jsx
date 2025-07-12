import React from 'react';
import { Header } from './components/header.jsx'

function App() {
  return (
    <>
      <Header />
      <main className="p-4">
        <h1 className="text-2xl font-bold flex items-center justify-center h-screen">Welcome to GigPoint!</h1>
      </main>
    </>
  );
}

export default App;
