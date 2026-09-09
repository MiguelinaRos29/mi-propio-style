// src/components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import styles from './Layout.module.scss';

const Layout = () => {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.contenido}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;