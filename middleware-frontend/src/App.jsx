import { useState, Suspense, lazy } from 'react'
import './App.css'

// We use React.lazy to avoid build errors if the library isn't there yet
const ExternalComponent = lazy(() =>
  import('./external-lib.js')
    .then(module => {
      // Logic to find a component: 
      // 1. Module default
      // 2. Module.App
      // 3. Module.Main
      return { default: module.default || module.App || module.Main || (() => <div>No component found in library</div>) };
    })
    .catch(() => ({ default: () => <div className="error">Failed to load dynamic library. Make sure to run the installation script.</div> }))
);

function App() {
  return (
    <div className="app-container">
      <h1>Middleware Frontend</h1>
      <div className="dynamic-content">
        <Suspense fallback={<div>Loading dynamic library...</div>}>
          <ExternalComponent />
        </Suspense>
      </div>
    </div>
  )
}

export default App
