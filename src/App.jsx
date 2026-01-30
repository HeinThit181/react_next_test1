import { Route, Routes } from 'react-router-dom';
import Items from './component/Items';
import ItemDetail from './component/ItemDetail';
import './App.css';
 
function App() {
  return (
    <Routes>
      <Route path="/items" element={<Items />} />
      <Route path="/items/:id" element={<ItemDetail />} />
    </Routes>
  );
}
 
export default App;
 
 