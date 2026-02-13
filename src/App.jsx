import { Route, Routes } from 'react-router-dom';
import TestAPI from './components/TestAPI';
import Items from './components/Items';
import ItemDetail from './components/ItemDetail';
import Login from './components/Login';
import Logout from './components/Logout';
import Profile from './components/Profile';
import UserList from './components/UserList';
import RequireAuth from './middleware/RequireAuth';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path='/test_api' element={<TestAPI />} />
      <Route path='/items' element={<Items />} />
      <Route path='/items/:id' element={<ItemDetail />} />
      <Route path='/login' element={<Login />} />
      <Route
        path='/profile'
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path='/logout'
        element={
          <RequireAuth>
            <Logout />
          </RequireAuth>
        }
      />
      <Route
        path='/users'
        element={
          <RequireAuth>
            <UserList />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
