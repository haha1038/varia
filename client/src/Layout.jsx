import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Wall from './components/Wall';
import ScrollMemory from './components/ScrollMemory';

export default function Layout() {
  return (
    <>
      <ScrollMemory />
      <Wall />
      <Header />
      <Outlet />
    </>
  );
}
