// src/pages/Home/Home.jsx
import { Link } from 'react-router-dom';
import styles from './Home.module.scss';

const categoriasDestacadas = [
  { nombre: 'Vestidos', slug: 'vestidos' },
  { nombre: 'Calzado', slug: 'calzado' },
  { nombre: 'Accesorios', slug: 'accesorios' },
];

const Home = () => {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1>Mi Propio Style</h1>
        <p>Moda y accesorios, seleccionados para ti.</p>
        <Link to="/catalogo" className={styles.botonHero}>
          Ver catálogo
        </Link>
      </section>

      <section className={styles.categorias}>
        <h2>Categorías destacadas</h2>
        <div className={styles.categoriasGrid}>
          {categoriasDestacadas.map((cat) => (
            <Link
              key={cat.slug}
              to={`/catalogo?categoria=${cat.slug}`}
              className={styles.categoriaCard}
            >
              {cat.nombre}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;